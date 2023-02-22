import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Object, BoxCollider} from "UnityEngine";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import PlayerSync from '../../Player/PlayerSync';
import MultiplayManager from '../../Common/MultiplayManager';

export default class StartFinishLine extends ZepetoScriptBehaviour {
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private m_collider : BoxCollider;
    private m_isStartCheck : boolean;
    private m_isFinish : boolean;

    private Start() {
        this.m_collider = this.GetComponent<BoxCollider>();
        this.Init();

        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;
        };
    }
    
    public Init(){
        this.m_collider.isTrigger = false;
        this.m_isStartCheck = false;
        this.m_isFinish = false;
    }
    
    public StartGame(){
        this.m_collider.isTrigger = true;
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }
        if(!this.m_isStartCheck) {
            this.m_isStartCheck = true;
            return;
        }
        if(!this.m_isFinish) {
            this.room.Send("FinishPlayer", MultiplayManager.instance.GetServerTime());
            this.m_isFinish = true;
        }    
    }

}