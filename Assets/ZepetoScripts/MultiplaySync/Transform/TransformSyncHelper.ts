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
    
    private room: Room;
    private multiplay: ZepetoWorldMultiplay;
    private m_isSteadyServerConnect:boolean = false;
    private m_Id: string;
    get Id() {
        return this.m_Id;
    }
    set Id(id:string){
        this.m_Id = id;
    }
    private m_isOwner: boolean = false;
    get isOwner() {
        return this.m_isOwner;
    }

    private m_sendCoroutine: Coroutine;
    private m_objectStatus:GameObjectStatus;
    private m_timeStampCount: number = 0;
    private m_positionCache:Vector3;
    private syncTransform: SyncTransform; // this transform state

    private readonly tick: number = 0.04;

    /** Interpolation **/
    private m_lastGetTimeOut: number = 0.04; //(newGet().timeStamp - prevGet().timeStamp) / 1000
    private m_bufferedState: SyncState[] = new Array<SyncState>(2);

    private newGet = () => this.m_bufferedState?.length > 0 ? this.m_bufferedState[0] : null;
    private prevGet = () => this.m_bufferedState?.length > 1 ? this.m_bufferedState[1] : null;

    private Start() {
        if(!this.m_Id) {
            SyncIndexManager.SyncIndex++;
            this.m_Id = SyncIndexManager.SyncIndex.toString();
        }
        this.m_positionCache = this.transform.position;

        this.SyncTransform();
    }

    private FixedUpdate() {
        if (!this.newGet())
            return;
        if (this.m_isOwner)
            return;
        if(this.m_objectStatus != GameObjectStatus.Enable)
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
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        if( null != MultiplayManager.instance?.room){
            this.room = MultiplayManager.instance.room;
            this.room.OnStateChange += this.OnStateChange;
        }
        else {
            this.multiplay.RoomJoined += (room: Room) => {
                this.room = room;
                this.room.OnStateChange += this.OnStateChange;
            };
        }
        this.StartCoroutine(this.SteadyServerConnect());
    }

    private OnStateChange(state: State, isFirst: boolean) {
        if (null == this.syncTransform) {
            this.syncTransform = state.SyncTransforms.get_Item(this.m_Id);
            if (this.syncTransform) {
                this.OnChangeTransform();
                this.ForceTarget();

                this.syncTransform.add_OnChange(() => {
                    this.OnChangeTransform();
                });
                this.room.OnStateChange -= this.OnStateChange;
            }
            else{
                // Initial definition if not defined on the server                
                this.m_objectStatus = GameObjectStatus.Enable;
                this.SendTransform();
                this.SendStatus();
            }
        }
    }

    // A function that changes the owner of the update.
    public ChangeOwner(ownerSessionId:string){
        if(null == this.room)
            this.room = MultiplayManager.instance.room;
        if(this.room.SessionId == ownerSessionId && !this.m_isOwner) {
            this.m_isOwner = true;
            this.m_sendCoroutine = this.StartCoroutine(this.CheckChangeTransform(this.tick));
        }
        else if(this.room.SessionId != ownerSessionId && this.m_isOwner) {
            this.m_isOwner = false;
            if(null != this.m_sendCoroutine)
                this.StopCoroutine(this.m_sendCoroutine);
        }
    }

    private OnChangeTransform() {
        if (this.m_isOwner) return;
        if(null!=this.syncTransform.status && this.syncTransform.status!= this.m_objectStatus) {
            this.m_objectStatus = this.syncTransform.status;
            this.ChangeStatus(this.syncTransform.status);
        }
        this.m_positionCache = this.transform.position;

        const pos:Vector3 = new Vector3(this.syncTransform.position.x, this.syncTransform.position.y, this.syncTransform.position.z);
        const rot: Quaternion = new Quaternion(this.syncTransform.rotation.x, this.syncTransform.rotation.y, this.syncTransform.rotation.z, this.syncTransform.rotation.w);
        const scale: Vector3 = new Vector3(this.syncTransform.scale.x, this.syncTransform.scale.y, this.syncTransform.scale.z);
        const localPos:Vector3 = new Vector3(this.syncTransform.localPosition.x, this.syncTransform.localPosition.y, this.syncTransform.localPosition.z);
        
        // Shift buffer contents, oldest data erased, 0 becomes 1
        this.m_bufferedState[1] = this.m_bufferedState[0];

        // Save currect received state as 0 in the buffer, safe to overwrite after shifting
        const interpolState: SyncState = {
            timestamp: this.syncTransform.sendTime,
            position: pos,
            localPosition:localPos,
            rotation: rot,
            scale: scale
        };
        this.m_bufferedState[0] = interpolState;

        if (this.m_timeStampCount == 0) {
            this.m_bufferedState[1] = interpolState;
        }
        // Increment state count but never exceed buffer size
        this.m_timeStampCount = Mathf.Min(this.m_timeStampCount + 1, this.m_bufferedState.length);
        const timeOut = (this.newGet().timestamp - this.prevGet().timestamp) /1000
        this.m_lastGetTimeOut = timeOut < this.tick ? this.m_lastGetTimeOut : timeOut;
    }

    private ChangeStatus(status:GameObjectStatus){
        switch(+status){
            case GameObjectStatus.Destroyed:
                Object.Destroy(this.gameObject);
                break;
        }
    }

    public ForceTarget() {
        if(this.m_isOwner)
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
        const targetDis:number = Vector3.Distance(targetPos, this.m_positionCache);

        let extraSpeed:number;
        if(this.InterpolationType == PositionInterpolationType.Estimate){
            extraSpeed = getDis == 0 ? this.moveSpeed : targetDis / this.m_lastGetTimeOut;
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
                const estimatedSpeed = Vector3.Distance(this.newGet().position, this.prevGet().position) / this.m_lastGetTimeOut;
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
        
        this.m_objectStatus = GameObjectStatus.Enable;

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
        data.Add("Id", this.m_Id);

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

        this.room.Send(MESSAGE.SyncTransform, data.GetObject());

    }

    private SendStatus(){
        const data = new RoomData();
        data.Add("Id", this.Id);
        data.Add("Status", this.m_objectStatus);
        this.room.Send(MESSAGE.SyncTransformStatus, data.GetObject());
    }

    private *SteadyServerConnect(){
        const pastPingCount = MultiplayManager.instance.pingCheckCount;
        yield new WaitUntil(()=>MultiplayManager.instance.pingCheckCount > pastPingCount+1);
        this.m_isSteadyServerConnect = true;
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