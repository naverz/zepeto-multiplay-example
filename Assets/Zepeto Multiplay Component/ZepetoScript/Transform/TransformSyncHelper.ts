import {ZepetoScriptBehaviour} from "ZEPETO.Script";
import {Room, RoomData} from "ZEPETO.Multiplay";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Transform, Vector3, WaitForSeconds, Quaternion, Time, Object, Coroutine, Mathf, WaitUntil} from "UnityEngine";
import * as UnityEngine from "UnityEngine";
import {State, SyncTransform} from "ZEPETO.Multiplay.Schema";
import SyncIndexManager from "../Common/SyncIndexManager";
import MultiplayManager, { GameObjectStatus } from '../Common/MultiplayManager';

export default class TransformSyncHelper extends ZepetoScriptBehaviour {
    public UpdateOwnerType: UpdateOwner = UpdateOwner.Undefine;

    /** Sync Options **/
    @Header("Position")
    public SyncPosition: boolean = true;
    public UseHardSnap: boolean = true;
    @Tooltip("Force the position to be modified if it is farther than this number.") public HardSnapIfDistanceGreaterThan: number = 10;
    public InterpolationType: PositionInterpolationType = PositionInterpolationType.Estimate;
    public ExtrapolationType: PositionExtrapolationType = PositionExtrapolationType.Disable;
    @Tooltip("The creditworthiness of the offset figure of the extrapolation.") public extraMultipler: number = 1;
    @Tooltip("This is the given speed for lerp/movetoward/fixedspeed options.")public moveSpeed: number = 10;
    @Header("Rotation")
    public SyncRotation: boolean = true;
    public RotationInterpolationType: RotationInterpolationType = RotationInterpolationType.Lerp;
    public rotateSpeed: number = 100;
    @Header("Scale")
    public SyncScale: boolean = false;
    public ScaleInterpolationType: ScaleInterpolationType = ScaleInterpolationType.Lerp;
    public scaleUpSpeed: number = 100;
    
    private _room: Room;
    private _multiplay: ZepetoWorldMultiplay;
    private _Id: string;
    get Id() {
        return this._Id;
    }
    set Id(id:string){
        this._Id = id;
    }
    private _isOwner: boolean = false;
    get isOwner() {
        return this._isOwner;
    }

    private _sendCoroutine: Coroutine;
    private _objectStatus:GameObjectStatus;
    private _timeStampCount: number = 0;
    private _positionCache:Vector3;
    private _syncTransform: SyncTransform; // this transform state

    private readonly _tick: number = 0.04;

    /** Interpolation **/
    private _lastGetTimeOut: number = 0.04; //(newGet().timeStamp - prevGet().timeStamp) / 1000
    private _bufferedState: SyncState[] = new Array<SyncState>(2);

    private newGet = () => this._bufferedState?.length > 0 ? this._bufferedState[0] : null;
    private prevGet = () => this._bufferedState?.length > 1 ? this._bufferedState[1] : null;

    private Start() {
        this.VersionInfo();
        
        if(!this._Id) {
            SyncIndexManager.SyncIndex++;
            this._Id = SyncIndexManager.SyncIndex.toString();
        }
        this._positionCache = this.transform.position;

        this.SyncTransform();
    }

    private FixedUpdate() {
        if (!this.newGet())
            return;
        if (this._isOwner)
            return;
        if(this._objectStatus != GameObjectStatus.Enable)
            return
        
        if (this.SyncPosition) {
            this.SyncPositionUpdate();
        }
        if (this.SyncRotation) {
            this.SyncRotationUpdate();
        }
        if (this.SyncScale) {
            this.SyncScaleUpdate();
        }
    }

    private SyncTransform() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._room = MultiplayManager.instance?.room;

        if (this._room != null) {
            this._room.OnStateChange += this.OnStateChange;
        } else {
            this._multiplay.RoomJoined += room => {
                this._room = room;
                this._room.OnStateChange += this.OnStateChange;
            };
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {
        if (null == this._syncTransform) {
            this._syncTransform = state.SyncTransforms.get_Item(this._Id);
            if (this._syncTransform) {
                this.OnChangeTransform();
                this.ForceTarget();

                this._syncTransform.add_OnChange(() => {
                    this.OnChangeTransform();
                });
                this._room.OnStateChange -= this.OnStateChange;
            }
            else{
                // Initial definition if not defined on the server                
                this._objectStatus = GameObjectStatus.Enable;
                this.SendTransform();
                this.SendStatus();
            }
        }
    }

    // A function that changes the owner of the update.
    public ChangeOwner(ownerSessionId:string){
        if(null == this._room)
            this._room = MultiplayManager.instance.room;
        if(this._room.SessionId == ownerSessionId && !this._isOwner) {
            this._isOwner = true;
            this._sendCoroutine = this.StartCoroutine(this.CheckChangeTransform(this._tick));
        }
        else if(this._room.SessionId != ownerSessionId && this._isOwner) {
            this._isOwner = false;
            if(null != this._sendCoroutine)
                this.StopCoroutine(this._sendCoroutine);
        }
    }

    private OnChangeTransform() {
        if (this._isOwner) return;
        if(null!=this._syncTransform.status && this._syncTransform.status!= this._objectStatus) {
            this._objectStatus = this._syncTransform.status;
            this.ChangeStatus(this._syncTransform.status);
        }
        this._positionCache = this.transform.position;

        const pos:Vector3 = new Vector3(this._syncTransform.position.x, this._syncTransform.position.y, this._syncTransform.position.z);
        const rot: Quaternion = new Quaternion(this._syncTransform.rotation.x, this._syncTransform.rotation.y, this._syncTransform.rotation.z, this._syncTransform.rotation.w);
        const scale: Vector3 = new Vector3(this._syncTransform.scale.x, this._syncTransform.scale.y, this._syncTransform.scale.z);
        const localPos:Vector3 = new Vector3(this._syncTransform.localPosition.x, this._syncTransform.localPosition.y, this._syncTransform.localPosition.z);
        
        // Shift buffer contents, oldest data erased, 0 becomes 1
        this._bufferedState[1] = this._bufferedState[0];

        // Save currect received state as 0 in the buffer, safe to overwrite after shifting
        const interpolState: SyncState = {
            timestamp: this._syncTransform.sendTime,
            position: pos,
            localPosition:localPos,
            rotation: rot,
            scale: scale
        };
        this._bufferedState[0] = interpolState;

        if (this._timeStampCount == 0) {
            this._bufferedState[1] = interpolState;
        }
        // Increment state count but never exceed buffer size
        this._timeStampCount = Mathf.Min(this._timeStampCount + 1, this._bufferedState.length);
        const timeOut = (this.newGet().timestamp - this.prevGet().timestamp) /1000
        this._lastGetTimeOut = timeOut < this._tick ? this._lastGetTimeOut : timeOut;
    }

    private ChangeStatus(status:GameObjectStatus){
        switch(+status){
            case GameObjectStatus.Destroyed:
                Object.Destroy(this.gameObject);
                break;
        }
    }

    public ForceTarget() {
        if(this._isOwner)
            return;
        if(null == this.newGet())
            return;
        if (this.SyncPosition) 
            this.transform.position = this.newGet().position;
        if (this.SyncRotation)
            this.transform.rotation = this.newGet().rotation;
        if (this.SyncScale)
            this.transform.localScale = this.newGet().scale;
    }

    private SyncPositionUpdate(){
        if(this.transform.parent != null){
            if(this.newGet().localPosition == this.prevGet().localPosition) {
                this.transform.localPosition = this.newGet().localPosition;
                return;
            }
        }
        
        if (this.UseHardSnap) {
            if (Vector3.Distance(this.newGet().position, this.transform.position) > this.HardSnapIfDistanceGreaterThan) {
                this.transform.position = this.newGet().position;
                return;
            }
        }

        const extraOffset = this.GetExtraPolationOffset();
        const targetPos: Vector3 = this.newGet().position + extraOffset;
        const getDis:number = Vector3.Distance(this.newGet().position, this.prevGet().position);
        const targetDis:number = Vector3.Distance(targetPos, this._positionCache);

        let extraSpeed:number;
        if(this.InterpolationType == PositionInterpolationType.Estimate){
            extraSpeed = getDis == 0 ? this.moveSpeed : targetDis / this._lastGetTimeOut;
        }
        else if(extraOffset != Vector3.zero){
            // extra speed = originDis : originSpeed = extraDis : extraSpeed 
            // => extraSpeed = originSpeed * extraDis / originDis
            extraSpeed = getDis == 0 ? this.moveSpeed : (this.moveSpeed * targetDis) / getDis;
            extraSpeed = Mathf.Clamp(extraSpeed, this.moveSpeed, this.moveSpeed * 2);
        }
        else{
            extraSpeed = this.moveSpeed;
        }

        switch (+this.InterpolationType) {
            case(PositionInterpolationType.None):
                this.transform.position = targetPos;
                break;
            case(PositionInterpolationType.Lerp):
                this.transform.position = Vector3.Lerp(this.transform.position, targetPos, extraSpeed * Time.fixedDeltaTime);
                break;
            case(PositionInterpolationType.MoveToward):
                this.transform.position = Vector3.MoveTowards(this.transform.position, targetPos, extraSpeed * Time.fixedDeltaTime );
                break;
            case(PositionInterpolationType.Estimate):
                this.transform.position = Vector3.MoveTowards(this.transform.position, targetPos, extraSpeed * Time.fixedDeltaTime );
                break;
        }
    }

    private SyncRotationUpdate(){
        switch (+this.RotationInterpolationType) {
            case(RotationInterpolationType.None):
                this.transform.rotation = this.newGet().rotation;
                break;
            case(RotationInterpolationType.Lerp):
                this.transform.rotation = Quaternion.Lerp(this.transform.rotation, this.newGet().rotation, this.rotateSpeed * Time.fixedDeltaTime);
                break;
            case(RotationInterpolationType.MoveToward):
                this.transform.rotation = Quaternion.RotateTowards(this.transform.rotation, this.newGet().rotation, this.rotateSpeed * Time.fixedDeltaTime);
                break;
        }
    }

    private SyncScaleUpdate(){
        switch (+this.ScaleInterpolationType) {
            case(ScaleInterpolationType.None):
                this.transform.localScale = this.newGet().scale;
                break;
            case(ScaleInterpolationType.Lerp):
                this.transform.localScale = Vector3.Lerp(this.transform.localScale, this.newGet().scale, this.scaleUpSpeed * Time.fixedDeltaTime);
                break;
            case(ScaleInterpolationType.MoveToward):
                this.transform.localScale = Vector3.MoveTowards(this.transform.localScale, this.newGet().scale, this.scaleUpSpeed * Time.fixedDeltaTime);
                break;
        }
    }

    private GetExtraPolationOffset() {
        if (this.ExtrapolationType == PositionExtrapolationType.Disable) {
            return Vector3.zero;
        }
        if(this.newGet().position == this.prevGet().position) {
            return Vector3.zero;
        }

        const moveDirection: UnityEngine.Vector3 = Vector3.Normalize(this.newGet().position - this.prevGet().position);
        const latency = (MultiplayManager.instance.GetServerTime() - this.newGet().timestamp)/1000;

        let extraPolationOffSet: Vector3 = Vector3.zero;
        switch (+this.ExtrapolationType) {
            case(PositionExtrapolationType.FixedSpeed):
                extraPolationOffSet = moveDirection * latency * this.moveSpeed * this.extraMultipler;
                break;
            case(PositionExtrapolationType.Estimate):
                const estimatedSpeed = Vector3.Distance(this.newGet().position, this.prevGet().position) / this._lastGetTimeOut;
                extraPolationOffSet = moveDirection * latency * estimatedSpeed * this.extraMultipler;
                break;
        }
        return extraPolationOffSet;
    }

    //isOwner
    private* CheckChangeTransform(tick: number) {
        const syncNextFrameMax: number = 10;
        let syncNextFrameCount: number = 0;
        let syncNowFrame: boolean = true;
        let isFirst = true;
        let pastPos: Vector3 = this.transform.position;
        let pastRot: Quaternion = this.transform.rotation;
        let pastScale: Vector3 = this.transform.localScale;
        
        let pastLocalPos: Vector3 = this.transform.localPosition;
        
        this._objectStatus = GameObjectStatus.Enable;

        while (true) {
            if (this.SyncPosition && pastPos != this.transform.localPosition) {
                pastPos = this.transform.localPosition;
                syncNowFrame = true;
            }
            if (this.SyncRotation && pastRot != this.transform.rotation) {
                pastRot = this.transform.rotation;
                syncNowFrame = true;
            }
            if (this.SyncScale && pastScale != this.transform.localScale) {
                pastScale = this.transform.localScale;
                syncNowFrame = true;
            }
            //Transmit any values that have changed values.
            if (syncNowFrame) {
                this.SendTransform();
                syncNowFrame = false;
                syncNextFrameCount = 0;

                if(isFirst) {
                    this.SendStatus();
                    isFirst = false;
                }
            }
            //Send 10 more frames even if stopped
            else if (syncNextFrameCount < syncNextFrameMax) {
                this.SendTransform();
                syncNextFrameCount++;
            }
            
            yield new WaitForSeconds(tick);
        }
    }

    private SendTransform() {
        const data = new RoomData();
        data.Add("Id", this._Id);

        const pos = new RoomData();
        pos.Add("x", this.transform.position.x);
        pos.Add("y", this.transform.position.y);
        pos.Add("z", this.transform.position.z);
        data.Add("position", pos.GetObject());

        const localPos = new RoomData();
        localPos.Add("x", this.transform.localPosition.x);
        localPos.Add("y", this.transform.localPosition.y);
        localPos.Add("z", this.transform.localPosition.z);
        data.Add("localPosition", localPos.GetObject());

        const rot = new RoomData();
        rot.Add("x", this.transform.rotation.x);
        rot.Add("y", this.transform.rotation.y);
        rot.Add("z", this.transform.rotation.z);
        rot.Add("w", this.transform.rotation.w);
        data.Add("rotation", rot.GetObject());

        const scale = new RoomData();
        scale.Add("x", this.transform.localScale.x);
        scale.Add("y", this.transform.localScale.y);
        scale.Add("z", this.transform.localScale.z);
        data.Add("scale", scale.GetObject());

        data.Add("sendTime", MultiplayManager.instance.GetServerTime());

        this._room.Send(MESSAGE.SyncTransform, data.GetObject());

    }

    private SendStatus(){
        const data = new RoomData();
        data.Add("Id", this.Id);
        data.Add("Status", this._objectStatus);
        this._room.Send(MESSAGE.SyncTransformStatus, data.GetObject());
    }
    
    @Header("Version 1.0.2")
    @SerializeField() private seeVersionLog:boolean = false;
    private VersionInfo(){
        if(!this.seeVersionLog)
            return;

        console.warn("TransformSyncHelper VersionInfos\n* Version 1.0.2\n* Github : https://github.com/JasperGame/zepeto-world-sync-component \n* Latest Update Date : 2023.02.28 \n");
    }
}

export enum UpdateOwner {
    Master, // Default
    Undefine, // It is separately designated by the user as a changeowner function.
}

export enum PositionInterpolationType {
    None = 0,
    Lerp,
    MoveToward,
    Estimate, // Estimate the speed with each received position and speed conversion value
}

export enum PositionExtrapolationType {
    Disable = 0,
    FixedSpeed,
    Estimate,
}

export enum RotationInterpolationType {
    None = 0,
    Lerp,
    MoveToward,
}

export enum ScaleInterpolationType {
    None = 0,
    Lerp,
    MoveToward,
}

interface SyncState {
    timestamp: number;
    position: Vector3;
    localPosition:Vector3;
    rotation: Quaternion;
    scale: Vector3;
}


enum MESSAGE {
    SyncTransform = "SyncTransform",
    SyncTransformStatus = "SyncTransformStatus"
}