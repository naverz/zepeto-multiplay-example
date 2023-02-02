import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {GameObject, Object, Quaternion, Transform, Vector3, WaitForSeconds, WaitUntil, Resources} from 'UnityEngine';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import TransformSyncHelper, { UpdateOwner } from '../Transform/TransformSyncHelper';
import DOTWeenSyncHelper from '../DOTween/DOTWeenSyncHelper';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';

export default class MultiplayManager extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    public room: Room;

    @Header("Server connection status (View Only)")
    @SerializeField() private m_pingCheckCount:number = 0;
    @SerializeField() private m_latency:number = 0;
    @SerializeField() private m_diffServerTime:number = 0;

    private masterSessionId:string;
    private tfHelpers: TransformSyncHelper[] = [];
    private dtHelpers: DOTWeenSyncHelper[] = [];

    get pingCheckCount(){ return this.m_pingCheckCount; }
    get latency(){ return this.m_latency; }

    /* Singleton */
    private static m_instance: MultiplayManager = null;
    public static get instance(): MultiplayManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<MultiplayManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(MultiplayManager.name).AddComponent<MultiplayManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (MultiplayManager.m_instance !== null && MultiplayManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            MultiplayManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {
        if(!this.multiplay)
            this.multiplay = this.GetComponent<ZepetoWorldMultiplay>();
        if(!this.multiplay) console.warn("Add ZepetoWorldMultiplay First");
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;
            this.StartCoroutine(this.SendPing(1));
            this.CheckMaster();
            this.GetInstantiate();
        }
        this.dtHelpers = Object.FindObjectsOfType<DOTWeenSyncHelper>();
    }

    /**Util**/
    private CheckMaster(){
        this.StartCoroutine(this.WaitPingCheck());

        this.room.AddMessageHandler(MESSAGE.MasterResponse, (masterSessionId :string) => {
            this.masterSessionId = masterSessionId;
            this.tfHelpers = Object.FindObjectsOfType<TransformSyncHelper>();
            this.tfHelpers.forEach((tf)=>{
                if(tf.UpdateOwnerType == UpdateOwner.Master){
                    tf.ChangeOwner(this.masterSessionId);
                }
            });
            this.dtHelpers.forEach((dt)=>{
                dt.ChangeOwner(this.masterSessionId);
            });
        });
    }

    private GetInstantiate(){
        this.room.Send(MESSAGE.RequestInstantiateCache);
        this.room.AddMessageHandler(MESSAGE.Instantiate, (message:InstantiateObj) => {
            const prefabObj = Resources.Load(message.prefabName) as GameObject;
            if(null==prefabObj){
                console.warn(`${message.prefabName} is null, Add Prefab in the Resources folder.`);
                return;
            }
            const spawnPosition = message.spawnPosition ? new Vector3(message.spawnPosition.x, message.spawnPosition.y, message.spawnPosition.z) : prefabObj.transform.position;
            const spawnRotation= message.spawnRotation ? new Quaternion(message.spawnRotation.x, message.spawnRotation.y, message.spawnRotation.z, message.spawnRotation.w) : prefabObj.transform.rotation

            const newObj:GameObject = Object.Instantiate(prefabObj, spawnPosition, spawnRotation) as GameObject;
            const tf = newObj?.GetComponent<TransformSyncHelper>();
            if(null == tf) { //Creates an none-sync object.
                //console.warn(`${tf.name} does not have a TransformSyncHelper script.`);
                return;
            }

            tf.Id = message.Id;
            if(tf.UpdateOwnerType == UpdateOwner.Master) {
                tf.ChangeOwner(this.masterSessionId);
            }
            else if(message.ownerSessionId){
                tf.ChangeOwner(message.ownerSessionId);
            }
        });
    }

    /** Destroy synchronization objects */
    public Destroy(DestroyObject: GameObject){
        const tf = DestroyObject.GetComponent<TransformSyncHelper>();
        const objId = tf?.Id;
        if(null == objId) {
            console.warn("Only objects that contain TransformSyncHelper scripts can be deleted.");
            return;
        }
        this.SendStatus(objId,GameObjectStatus.Destroyed);
        Object.Destroy(DestroyObject);
    }

    /** /Asset/Resources/ Add the prefabs to create in the path. Add TransformSyncHelper.ts to the prefab to synchronize objects as well as creation.
     @param prefabName The name or path of the prefab on the resource folder ( ex) Monsters/zombie)
     @param ownerSessionId Inject owner into objects whose transform sync type is Undefine
     */
    public Instantiate(prefabName: string, ownerSessionId? : string, spawnPosition?: Vector3, spawnRotation?: Quaternion){
        const newObjId = MultiplayManager.instance.GetServerTime().toString();

        const data = new RoomData();
        data.Add("Id", newObjId);
        data.Add("prefabName", prefabName);
        data.Add("ownerSessionId", ownerSessionId);
        if(undefined != spawnPosition) {
            const position = new RoomData();
            position.Add("x",spawnPosition.x);
            position.Add("y",spawnPosition.y);
            position.Add("z",spawnPosition.z);
            data.Add("spawnPosition", position.GetObject());
        }

        if(undefined != spawnRotation) {
            const rotation = new RoomData();
            rotation.Add("x",spawnRotation.x);
            rotation.Add("y",spawnRotation.y);
            rotation.Add("z",spawnRotation.z);
            rotation.Add("w",spawnRotation.w);
            data.Add("spawnRotation", rotation.GetObject());
        }

        this.room.Send(MESSAGE.Instantiate, data.GetObject());
    }

    private bPaused: boolean = false;
    private OnApplicationPause(pause: boolean) {
        if (pause && !this.bPaused) {
            this.PauseUser();
        }
        else if (!pause && this.bPaused) {
            this.UnPauseUser();
        }
    }

    private PauseUser(){
        this.room?.Send(MESSAGE.PauseUser);

        this.bPaused = true;
        this.m_pingCheckCount = 0;
        this.tfHelpers = Object.FindObjectsOfType<TransformSyncHelper>();
        this.tfHelpers.forEach((tf)=> {
            if(tf.UpdateOwnerType == UpdateOwner.Master) {
                tf.ChangeOwner("");
            }
            else if(tf.isOwner){
                this.SendStatus(tf.Id,GameObjectStatus.Pause);
            }
        });
        this.dtHelpers.forEach((dt)=> {
            dt.ChangeOwner("");
        });
    }

    private UnPauseUser(){
        this.room?.Send(MESSAGE.UnPauseUser);

        this.bPaused = false;
        this.tfHelpers = Object.FindObjectsOfType<TransformSyncHelper>();
        this.tfHelpers.forEach((tf)=>{
            if(tf.isOwner){
                this.SendStatus(tf.Id,GameObjectStatus.Enable);
            }
            else{
                tf.ForceTarget();
            }
        });
    }

    /** Ping every 1 second to check latency with the server */
    private *SendPing(ping:number){
        let RequestTime = Number(+new Date());
        let ResponseTime = Number(+new Date());
        let isResponseDone = false;

        this.room.AddMessageHandler(MESSAGE.CheckServerTimeResponse, (serverTime: number) => {
            ResponseTime = Number(+new Date());
            this.m_latency = (ResponseTime - RequestTime) / 2
            this.m_diffServerTime = Number(serverTime) - ResponseTime - this.latency;
            this.m_pingCheckCount++;
            isResponseDone = true;
        });

        while(true) {
            if(!this.bPaused) {
                this.room.Send(MESSAGE.CheckServerTimeRequest);
                RequestTime = Number(+new Date());
                yield new WaitUntil(() => isResponseDone == true);
            }
            isResponseDone = false;
            yield new WaitForSeconds(ping);
        }
    }

    private * WaitPingCheck(){
        if(this.pingCheckCount == 0)
            yield new WaitUntil(()=> this.pingCheckCount > 0)
        this.room.Send(MESSAGE.CheckMaster);
    }

    public GetServerTime(){
        return this.m_diffServerTime + Number(+new Date());
    }

    private SendStatus(id:string, status:GameObjectStatus){
        const data = new RoomData();
        data.Add("Id", id);
        data.Add("Status", status);
        this.room.Send(MESSAGE.SyncTransformStatus, data.GetObject());
    }
}

interface InstantiateObj{
    Id:string;
    prefabName:string;
    ownerSessionId?:string;
    spawnPosition?:Vector3;
    spawnRotation?:Quaternion;
}

export enum GameObjectStatus{
    Destroyed = -1,
    Disable,
    Enable,
    Pause,
}

enum MESSAGE {
    CheckServerTimeRequest = "CheckServerTimeRequest",
    CheckServerTimeResponse = "CheckServerTimeResponse",
    CheckMaster = "CheckMaster",
    MasterResponse = "MasterResponse",
    RequestInstantiateCache = "RequestInstantiateCache",
    Instantiate = "Instantiate",
    PauseUser = "PauseUser",
    UnPauseUser = "UnPauseUser",
    SyncTransformStatus = "SyncTransformStatus"
}