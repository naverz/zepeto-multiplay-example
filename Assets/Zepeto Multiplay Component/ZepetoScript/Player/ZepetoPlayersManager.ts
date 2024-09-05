import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {WorldService, ZepetoWorldMultiplay, Content, OfficialContentType, ZepetoWorldContent} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import {SpawnInfo, ZepetoPlayer, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import {State, Player} from "ZEPETO.Multiplay.Schema";
import {GameObject, Object, Quaternion, Vector3, WaitForSeconds} from "UnityEngine";
import PlayerSync from './PlayerSync';
import TransformSyncHelper,{PositionExtrapolationType, PositionInterpolationType} from '../Transform/TransformSyncHelper';
import ToolClassGather from '../ToolClass/ToolClassGather';

export enum ZepetoPlayerSpawnType {
    NoneSpawn,//Do not create players
    SinglePlayerSpawnOnStart,//Single zepeto player created at start
    MultiplayerSpawnOnJoinRoom,// Creates a multi-zepeto player when connected to a server (Default)
    MultiplayerSpawnLater,// When you calling "ZepetoPlayers.instance.CreatePlayerWithUserId()" to another script
}

// This script manages the spawning and synchronization of Zepeto players in a multiplayer game.
export default class ZepetoPlayersManager extends ZepetoScriptBehaviour {
    /** Options **/
    @Header("SpawnOption")
    public readonly ZepetoPlayerSpawnType : ZepetoPlayerSpawnType = ZepetoPlayerSpawnType.MultiplayerSpawnOnJoinRoom;

    @Header("Position")
    public readonly UseHardSnap: boolean = true;
    @Tooltip("Force the position to be modified if it is farther than this number.") @SerializeField() private readonly HardSnapIfDistanceGreaterThan: number = 10;
    public readonly InterpolationType: PositionInterpolationType = PositionInterpolationType.MoveToward;
    public readonly ExtrapolationType: PositionExtrapolationType = PositionExtrapolationType.Disable;
    @Tooltip("The creditworthiness of the offset figure of the extrapolation.") @SerializeField() private readonly extraMultipler: number = 1;
    @Header("Gesture Sync")
    public readonly GetAnimationClipFromResources: boolean = true; // You can synchronize gestures within a resource folder.
    public readonly UseZepetoGestureAPI: boolean = false; // Synchronize the Zepeto World Gesture API animation.

    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _currentPlayers: Map<string, Player> = new Map<string, Player>();
    
    
    /* Singleton */
    private static m_instance: ZepetoPlayersManager = null;
    public static get instance(): ZepetoPlayersManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<ZepetoPlayersManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(ZepetoPlayersManager.name).AddComponent<ZepetoPlayersManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (ZepetoPlayersManager.m_instance !== null && ZepetoPlayersManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            ZepetoPlayersManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {
        switch (+this.ZepetoPlayerSpawnType){
            case ZepetoPlayerSpawnType.NoneSpawn:
                break;
            case ZepetoPlayerSpawnType.SinglePlayerSpawnOnStart:
                this.CreateSinglePlayer();
                break;
            case ZepetoPlayerSpawnType.MultiplayerSpawnOnJoinRoom:
            case ZepetoPlayerSpawnType.MultiplayerSpawnLater:
                this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
                this._multiplay.RoomJoined += (room: Room) => {
                    this._room = room;
                    this._room.OnStateChange += this.OnStateChange;
                }
                ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                    this.AddPlayerSync(sessionId);
                });
                if(this.UseZepetoGestureAPI) {
                    this.ContentRequest();
                }
                break;
        }
    }
    
    /** singleplayer Spawn **/
    private CreateSinglePlayer(){
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId,new SpawnInfo(), true);
    }
    
    /** multiplayer Spawn **/
    private OnStateChange(state: State, isFirst: boolean) {
        const join = new Map<string, Player>();
        const leave = new Map<string, Player>(this._currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this._currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Create a player instance for players that enter the Room
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Remove the player instance for players that exit the room
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this._currentPlayers.set(sessionId, player);

        if(this.ZepetoPlayerSpawnType == ZepetoPlayerSpawnType.MultiplayerSpawnOnJoinRoom) {
            const spawnInfo = new SpawnInfo();
            spawnInfo.position = this.transform.position;
            spawnInfo.rotation = this.transform.rotation;
            const isLocal = this._room.SessionId === player.sessionId;
            ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
        }
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnLeavePlayer] players - sessionId : ${sessionId}`);
        this._currentPlayers.delete(sessionId);
        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }
    
    // Attach a sync script to the ZEPETO character.
    private AddPlayerSync(sessionId:string){
        const isLocal:boolean = this._room.SessionId === sessionId;
        const player: Player = this._currentPlayers.get(sessionId);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        
        const tfHelper = zepetoPlayer.character.transform.gameObject.AddComponent<TransformSyncHelper>();
        tfHelper.Id = sessionId;
        tfHelper.UseHardSnap = this.UseHardSnap;
        tfHelper.HardSnapIfDistanceGreaterThan= this.HardSnapIfDistanceGreaterThan;
        tfHelper.InterpolationType = this.InterpolationType;
        tfHelper.ExtrapolationType = this.ExtrapolationType;
        tfHelper.extraMultipler = this.extraMultipler;
        tfHelper.ChangeOwner(sessionId);

        const playerStateSync = zepetoPlayer.character.transform.gameObject.AddComponent<PlayerSync>();
        playerStateSync.isLocal = isLocal;
        playerStateSync.player = player;
        playerStateSync.zepetoPlayer = zepetoPlayer;
        playerStateSync.GetAnimationClipFromResources = this.GetAnimationClipFromResources;
        playerStateSync.UseZepetoGestureAPI = this.UseZepetoGestureAPI;
        playerStateSync.tfHelper = tfHelper;

        // Inject the character's speed into TransformSyncHelper during character speed-based synchronization.
        const isUseInjectSpeed:boolean = this.InterpolationType == PositionInterpolationType.MoveToward 
            || this.InterpolationType == PositionInterpolationType.Lerp 
            || this.ExtrapolationType == PositionExtrapolationType.FixedSpeed;
        playerStateSync.isUseInjectSpeed = isUseInjectSpeed;
    }

    // This is <Content Id, Content> Map for content such as official gestures and poses.
    public GestureAPIContents:Map<string,Content> =  new Map<string, Content>();
    
    private ContentRequest() {
        //API support through the ZepetoWorldContent API, and the Gesture API content map is API contents map.
        ZepetoWorldContent.RequestOfficialContentList(OfficialContentType.All, contents => {
            for(let i=0; i<contents.length; i++) {
                this.GestureAPIContents.set(contents[i].Id, contents[i]);
            }
            ToolClassGather.Instance.ZPMGestureAPIContents = this.GestureAPIContents;
        });
    }
    
    /** MultiplayerSpawnLater SampleCode */
    
    /** Creates all players who have entered a room that has not yet been created. 
     * When MultiplayerSpawnLater option, call and use it at the desired time.*/
    public CreateAllPlayers(){
        const spawnInfo = new SpawnInfo();
        spawnInfo.position = this.transform.position;
        spawnInfo.rotation = this.transform.rotation;
        this._currentPlayers.forEach((player:Player)=> {
            const isLocal = this._room.SessionId === player.sessionId;
            if(!ZepetoPlayers.instance.HasPlayer(player.sessionId)) {
                console.log(`Spawn ${player.sessionId}`);
                ZepetoPlayers.instance.CreatePlayerWithUserId(player.sessionId, player.zepetoUserId, spawnInfo, isLocal);
            }
        });
    }

    /** This is a sample code that creates my character in the
     * MultiplayerSpawnLater option and generates other users who were on the server after 10 seconds of play.*/
    private * WaitTutorial(){
        const spawnInfo = new SpawnInfo();
        spawnInfo.position = this.transform.position;
        spawnInfo.rotation = this.transform.rotation;
        ZepetoPlayers.instance.CreatePlayerWithUserId(this._room.SessionId, WorldService.userId, spawnInfo, true);
        
        yield new WaitForSeconds(10);
        this.CreateAllPlayers();
    }
}
