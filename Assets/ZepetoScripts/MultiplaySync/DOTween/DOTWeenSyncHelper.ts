import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {GameObject, Object, Time, Vector3, WaitForSeconds, WaitUntil, Coroutine} from 'UnityEngine';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import SyncIndexManager from '../Common/SyncIndexManager';
import MultiplayManager from '../Common/MultiplayManager';

export default class DOTWeenSyncHelper extends ZepetoScriptBehaviour {
    @Header("Version 1.0.1")

    /** It is used for game objects that move through a given path.
     * Unlike TransformSync, which updates to the server every tick, it uses optimized server resources 
     * because it synchronizes only once on the first entry and the rest is calculated by the client.
     * You can also extrapolate more accurately against server delays. */
    
    /** Options **/
    @SerializeField() private syncType: SyncType = SyncType.Sync;
    @SerializeField() private tweenType: TweenType = TweenType.Circulation;
    @SerializeField() private loopType: LoopType = LoopType.Repeat;
    @Tooltip("Calibrates server time delay (default : true)") @SerializeField() private SyncExtrapolation: boolean = true;
    @Tooltip("At least 2 positions are required.") @SerializeField() private TweenPosition: Vector3[];
    @SerializeField() private moveSpeed: number = 1;
    @Tooltip("Receives the location again every certain time (default : false)")@SerializeField() private forceReTarget: boolean = false;
        @SerializeField() private forceReTargetBySeconds: number = 60;
        
    /** multiplay **/
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private m_Id: string;
    get Id() {
        return this.m_Id;
    }

    /** DOTWeen **/
    private nowIndex: number;
    private nextIndex: number;
    private onewayloopCount: number;    // one-way number count, One lap => loopCountDouble 2, 
    private isLoopEnd: boolean;

    /** Sync **/
    private m_isMasterClient: boolean = false;
    get isMasterClient() {
        return this.m_isMasterClient;
    }
    set isMasterClient(isMaster :boolean) {
        this.m_isMasterClient = isMaster;
    }
    private m_diffServerTime: number;
    private m_sendCoroutine :Coroutine;
    
    private Awake() {
        if (this.TweenPosition.length < 2) {
            this.enabled = false;
            console.warn('Error: Enter at least two positions in the Twin Position.');
            return;
        }
    }
    
    private Start(){
        this.Init();
        this.VersionInfo();
        
        SyncIndexManager.SyncIndex++;
        this.m_Id = SyncIndexManager.SyncIndex.toString();
        if (this.syncType == SyncType.Sync) {
            this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
            this.multiplay.RoomJoined += (room: Room) => {
                this.room = room;
                this.SyncMessageHandler();
            };
        }
    }

    private FixedUpdate() {
        if (this.isLoopEnd) 
            return;

        this.transform.localPosition = Vector3.MoveTowards(this.transform.localPosition, this.TweenPosition[this.nextIndex], this.moveSpeed * Time.fixedDeltaTime);
        if (this.transform.localPosition == this.TweenPosition[this.nextIndex]) {
            this.GetNextIndex();
        }
    }

    private Init() {
        this.transform.localPosition = this.TweenPosition[0];
        this.nowIndex = 0;
        this.nextIndex = 1;
        this.onewayloopCount = 0;
        this.isLoopEnd = false;
        this.m_diffServerTime = 0;
    }

    private GetNextIndex() {            
        this.nowIndex = this.nextIndex;
        switch (+this.tweenType) {
            case TweenType.Circulation:
                if (this.nowIndex == this.TweenPosition.length - 1) {
                    this.nextIndex = 0;
                    this.onewayloopCount++;
                } else if (this.nowIndex == 0) {
                    this.nextIndex++;
                    this.onewayloopCount++;
                } else
                    this.nextIndex++;
                break;
            case TweenType.Linear:
                if (this.nowIndex == this.TweenPosition.length - 1) {
                    this.onewayloopCount++;
                } else if (this.nowIndex == 0) {
                    this.onewayloopCount++;
                }
                this.nextIndex = this.onewayloopCount % 2 == 0 ? this.nowIndex + 1 : this.nowIndex - 1;
                break;
            case TweenType.TeleportFirstPoint:
                if (this.nowIndex == this.TweenPosition.length - 1) {
                    if (this.loopType != LoopType.JustOneWay) {
                        this.transform.localPosition = this.TweenPosition[0];
                        this.onewayloopCount++;
                    }
                    this.nextIndex = 1;
                    this.onewayloopCount++;
                } else {
                    this.nextIndex++;
                }
                break;
        }
        if (!this.isLoopEnd) {
            this.EndCheck();
        }
    }

    private SyncMessageHandler() {
        const ResponseId: string = MESSAGE.ResponsePosition + this.m_Id;
        this.room.AddMessageHandler(ResponseId, (message: syncTween) => {
            this.StartCoroutine(this.GetSyncPosition(message));
        });
    }
    
    private *GetSyncPosition(message:syncTween){
        this.nextIndex = message.nextIndex;
        this.onewayloopCount = message.loopCount;
        this.EndCheck();

        const getPos = new Vector3(message.position.x,message.position.y,message.position.z);

        if (!this.SyncExtrapolation || this.isLoopEnd) {
            this.transform.localPosition = getPos;
            return;
        }
        
        if(MultiplayManager.instance.pingCheckCount == 0)
            yield new WaitUntil(()=>MultiplayManager.instance.pingCheckCount > 0);
        
        const latency = (MultiplayManager.instance.GetServerTime() - Number(message.sendTime)) / 1000;
        this.CalculateExtrapolation(getPos,latency);
    }
    
    private CalculateExtrapolation(getPos:Vector3, latency:number){
        const dir = Vector3.Normalize(this.TweenPosition[this.nextIndex] - getPos);

        let extraOffSet:Vector3 = dir * latency * this.moveSpeed;
        let posibleMoveSize:number = Vector3.Magnitude(this.TweenPosition[this.nextIndex] - getPos);
        let extraOffsetSize:number = Vector3.Magnitude(extraOffSet);

        //Navigating to the next index if it exceeds the acceptable range within one index
        while(extraOffsetSize > posibleMoveSize) {
            extraOffsetSize -= posibleMoveSize;

            this.GetNextIndex();
            getPos = this.TweenPosition[this.nowIndex];
            extraOffSet = Vector3.Normalize(this.TweenPosition[this.nextIndex] - getPos) * extraOffsetSize;
            posibleMoveSize = Vector3.Magnitude(this.TweenPosition[this.nextIndex] - getPos);
        }
        let EstimatePos = getPos + extraOffSet;
        this.transform.localPosition = EstimatePos;
    }

    private EndCheck() {
        if (this.loopType != LoopType.Repeat) {
            if (this.onewayloopCount >= this.loopType) {
                this.isLoopEnd = true;
            }
        }
    }
    
    public ChangeOwner(ownerSessionId:string){
        if(null == this.room)
            this.room = MultiplayManager.instance.room;
        if(this.room.SessionId == ownerSessionId){
            if(!this.m_isMasterClient) {
                this.m_isMasterClient = true;
                this.m_sendCoroutine = this.StartCoroutine(this.ForceReTargetCoroutine());
            }
            this.SendPoint();
        }
        else if(this.room.SessionId != ownerSessionId && this.m_isMasterClient) {
            this.m_isMasterClient = false;
            if(null != this.m_sendCoroutine)
                this.StopCoroutine(this.m_sendCoroutine);
        }
    }
    
    private *ForceReTargetCoroutine(){
        while(true){
            if(this.forceReTarget)
                yield new WaitForSeconds(this.forceReTargetBySeconds);
            else 
                return;
            this.SendPoint();
        }
    }

    private SendPoint() {
        const data = new RoomData();
        data.Add("Id", this.m_Id);

        const pos = new RoomData();
        pos.Add("x", this.transform.localPosition.x);
        pos.Add("y", this.transform.localPosition.y);
        pos.Add("z", this.transform.localPosition.z);
        data.Add("position", pos.GetObject());

        data.Add("nextIndex", this.nextIndex);
        data.Add("loopCount", this.onewayloopCount);
        data.Add("sendTime", MultiplayManager.instance.GetServerTime());

        this.room?.Send(MESSAGE.SyncDOTween, data.GetObject());
    }

    @Header("Version 1.0.1")
    @SerializeField() private seeVersionLog:boolean = false;
    private VersionInfo(){
        if(!this.seeVersionLog)
            return;

        console.warn("DOTweenSyncHelper VersionInfos\n* Version 1.0.1\n* Github : https://github.com/JasperGame/zepeto-world-sync-component \n* Latest Update Date : 2023.02.13 \n");
    }
}

export enum SyncType {
    Sync = 0,
    NoneSync = 1
}

export enum TweenType {
    //Circular movement 1 -> 2 -> 3 -> 4 -> 1 -> 2 -> 3 -> 4
    Circulation = 0,
    //Back to the Linear Way 1 -> 2 -> 3 -> 4 -> 3 -> 2 -> 1
    Linear,
    //Teleport to the first point when the end point is reached  1 -> 2 -> 3 -> 4 -> 1(teleport)
    TeleportFirstPoint
}

export enum LoopType {
    Repeat = 0,
    JustOneWay,
    JustOneRoundTrip
}

interface syncTween {
    Id: string,
    position: Vector3,
    nextIndex: number,
    loopCount: number,
    sendTime: number,
}

enum MESSAGE {
    RequestPosition = "RequestPosition",
    ResponsePosition = "ResponsePosition",
    SyncDOTween = "SyncDOTween"
}