import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Object, BoxCollider} from "UnityEngine";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import MultiplayManager from '../../Common/MultiplayManager';

export default class StartFinishLine extends ZepetoScriptBehaviour {
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _collider : BoxCollider;
    private _isStartCheck : boolean;
    private _isFinish : boolean;

    private Start() {
        this._collider = this.GetComponent<BoxCollider>();
        this.Init();

        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
        };
    }
    
    public Init(){
        this._collider.isTrigger = false;
        this._isStartCheck = false;
        this._isFinish = false;
    }
    
    public StartGame(){
        this._collider.isTrigger = true;
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }
        
        if(!this._isStartCheck) {
            this._isStartCheck = true;
            return;
        }
        if(!this._isFinish) {
            this._room.Send("FinishPlayer", MultiplayManager.instance.GetServerTime());
            this._isFinish = true;
        }    
    }

}