import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {Collider, Transform, Vector3, Quaternion, Rigidbody, Object, WaitUntil} from "UnityEngine";
import {Room, RoomData} from "ZEPETO.Multiplay";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {ZepetoCharacter, ZepetoPlayer, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import {Player, State} from 'ZEPETO.Multiplay.Schema'
import PlayerSync from '../Player/PlayerSync';
import DOTWeenSyncHelper from '../DOTween/DOTWeenSyncHelper';

export default class BlockPacking extends ZepetoScriptBehaviour {
    //A script in which the Zepeto character is moved the same as the block on a DOTween moving block.
    
    private m_dtHelper: DOTWeenSyncHelper;
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private isLocalCharacterOnBlock :boolean = false;
    
    private Start() {
        this.m_dtHelper = this.GetComponent<DOTWeenSyncHelper>();
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;

            //When a new player comes in, send the player information about the currently up blocks.
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                if(this.isLocalCharacterOnBlock) {
                    const data = new RoomData();
                    data.Add("transformId", this.m_dtHelper.Id);
                    data.Add("newJoinSessionId", sessionId);

                    this.room.Send("SendBlockEnterCache", data.GetObject());
                }
            });
            
            this.room.AddMessageHandler("BlockEnter" + this.m_dtHelper.Id, (enteredSessionId) => {
                this.StartCoroutine(this.PlayerPacking(enteredSessionId.toString()));
            });
            this.room.AddMessageHandler("BlockExit" + this.m_dtHelper.Id, (exitedSessionId) => {              
                this.StartCoroutine(this.PlayerUnPacking(exitedSessionId.toString()));
            });
        };
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }

        if(this.isLocalCharacterOnBlock)
            return;
        
        this.isLocalCharacterOnBlock = true;
        this.room.Send("BlockEnter", this.m_dtHelper.Id);
    }
    
    private OnTriggerExit(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }
        this.isLocalCharacterOnBlock = false;
        this.room.Send("BlockExit", this.m_dtHelper.Id);
    }

    private *PlayerPacking(enteredSessionId:string){
        //Wait until the player is fully loaded.
        yield new WaitUntil(()=>ZepetoPlayers.instance.HasPlayer(enteredSessionId));
        const player = ZepetoPlayers.instance.GetPlayer(enteredSessionId).character;
        player.transform.parent = this.transform;
    }

    private *PlayerUnPacking(exitedSessionId:string){
        yield new WaitUntil(()=>ZepetoPlayers.instance.HasPlayer(exitedSessionId));
        const player = ZepetoPlayers.instance.GetPlayer(exitedSessionId).character
        player.transform.parent = null;
    }
}