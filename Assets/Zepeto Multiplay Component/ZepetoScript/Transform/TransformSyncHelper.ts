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
    @Tooltip("This is the given speed for lerp / movetoward / fixedspeed options.")public moveSpeed: number = 10;
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
    private _isOwner: boolean = false;
    private _ownerSessionId:string;

    set Id(id:string){
        this._Id = id;
    }
    get Id() {
        return this._Id;
    }
    get isOwner() {
        return this._isOwner;
    }
    get OwnerSessionId(){
        return this._ownerSessionId;
    } 

    private _sendCoroutine: Coroutine;
    private _objectStatus:GameObjectStatus; // gameObjectStatus {Destroyed, Disable, Enable, Pause}
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
        if (this.isOwner)
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
            this.StartCoroutine(this.BindingState());
        } else {
            this._multiplay.RoomJoined += room => {
                this._room = room;
                this.StartCoroutine(this.BindingState());
            };
        }
    }

    // Access the entire server schema at first startup and connect the sync Id schema.
    private *BindingState() {
        if (null == this._syncTransform) {
            this._syncTransform = MultiplayManager.instance?.room?.State?.SyncTransforms?.get_Item(this._Id)
            if (this._syncTransform) {
                this.OnChangeTransform();
                this.ForceTarget();

                this._syncTransform.add_OnChange(() => {
                    this.OnChangeTransform();
                });
            }
            else{
                // Initial definition if not defined on the server        
                // Create State 
                this._objectStatus = GameObjectStatus.Enable;
                this.SendTransform();
                this.SendStatus();

                yield new WaitUntil(()=>MultiplayManager.instance?.room?.State?.SyncTransforms?.get_Item(this._Id) !== null);
                this.StartCoroutine(this.BindingState());
            }
        }
    }

    // A function that changes the owner of the update.
    public ChangeOwner(ownerSessionId: string) {
        this._ownerSessionId = ownerSessionId;
        if(null == this._room)
            this._room = MultiplayManager.instance.room;
        if(this._room.SessionId == ownerSessionId && !this._isOwner) {
            this._isOwner = true;
            this._sendCoroutine = this.StartCoroutine(this.CheckChangeTransform(this._tick));
        }
        else if(this._room.SessionId != ownerSessionId && this._isOwner) {
            this._isOwner = false;
            if (null != this._sendCoroutine)
                this.StopCoroutine(this._sendCoroutine);
        }
    }

    // when isOwner === false, Receives changed information from the server.
    // Called when there is a change in the server schema.
    private OnChangeTransform() {
        if (this._isOwner) return;

        const syncTransform = this._syncTransform;
        const bufferedState = this._bufferedState;

        if (syncTransform.status != this._objectStatus) {
            this._objectStatus = syncTransform.status;
            this.ChangeStatus(syncTransform.status);
        }

        const { position, rotation, scale, localPosition } = syncTransform;

        // Shift buffer contents, oldest data erased, 0 becomes 1
        bufferedState[1] = bufferedState[0];

        // Save current received state as 0 in the buffer, safe to overwrite after shifting
        const interpolState: SyncState = {
            timestamp: syncTransform.sendTime,
            position: new Vector3(position.x, position.y, position.z),
            localPosition: new Vector3(localPosition.x, localPosition.y, localPosition.z),
            rotation: new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
            scale: new Vector3(scale.x, scale.y, scale.z),
        };
        bufferedState[0] = interpolState;

        if (this._timeStampCount == 0) {
            bufferedState[1] = interpolState;
        }

        // Increment state count but never exceed buffer size
        this._timeStampCount = Mathf.Min(this._timeStampCount + 1, bufferedState.length);

        const timeStampDelta = syncTransform.sendTime - bufferedState[1].timestamp;
        const timeOut = timeStampDelta / 1000;
        this._lastGetTimeOut = timeOut < this._tick ? this._lastGetTimeOut : timeOut;
    }

    private ChangeStatus(status:GameObjectStatus){
        if(status == GameObjectStatus.Destroyed)
            Object.Destroy(this.gameObject);
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
        //If the object has a parent, and only the parent is moving, it is more natural to use the local coordinate system to move Lerp.
        if(this.transform.parent != null){
            if(Vector3.Distance(this.newGet().localPosition, this.prevGet().localPosition) < 0.01) {
                this.transform.localPosition = Vector3.Lerp(this.transform.localPosition, this.newGet().localPosition, this.moveSpeed * Time.fixedDeltaTime);
                return;
            }
        }

        //Teleport the object if it is further than a certain distance.
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
    
    /**
     * Calculates an extrapolation offset based on the difference between the current and previous positions.
     * If the extrapolation type is set to Disable, it returns a zero vector.
     * Calculates the move direction between the current and previous positions, and the latency between the current time and the timestamp of the current position.
     * Uses a switch statement to determine the type of extrapolation to be used and calculates the extrapolation offset accordingly.
     * Returns the extrapolation offset calculated.
     */
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

    // when isOwner, Sends information to the server.
    private* CheckChangeTransform(tick: number) {
        const syncNextFrameMax: number = 10;
        let syncNextFrameCount: number = 0;
        let syncNowFrame: boolean = true;
        let isFirst = true;
        let pastPos: Vector3 = this.transform.localPosition;
        let pastRot: Quaternion = this.transform.localRotation;
        let pastScale: Vector3 = this.transform.localScale;

        this._objectStatus = GameObjectStatus.Enable;

        while (true) {
            // Check if position has changed
            if (this.SyncPosition && pastPos != this.transform.localPosition) {
                pastPos = this.transform.localPosition;
                syncNowFrame = true;
            }
            // Check if rotation has changed
            if (this.SyncRotation && pastRot != this.transform.localRotation) {
                pastRot = this.transform.localRotation;
                syncNowFrame = true;
            }
            // Check if scale has changed
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

        // Send data to server
        this._room.Send(MESSAGE.SyncTransform, data.GetObject());

    }

    private SendStatus(){
        const data = new RoomData();
        data.Add("Id", this.Id);
        data.Add("Status", this._objectStatus);
        this._room.Send(MESSAGE.SyncTransformStatus, data.GetObject());
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