import { Collider, Vector3, Rigidbody, Object} from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoPlayer, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class SoccerBall extends ZepetoScriptBehaviour {
    //It's a soccer ball script that applies a physical collision.
    
    private _tfHelper:TransformSyncHelper;
    private _rigidBody:Rigidbody;
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;

    private Start() {
        this._tfHelper = this.GetComponent<TransformSyncHelper>();
        this._rigidBody = this.GetComponent<Rigidbody>();
        
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room= room;
            this._room.AddMessageHandler("ChangeOwner"+this._tfHelper.Id, (OwnerSessionId) => {
                //If there is a real-time physical conflict, such as a soccer ball, change the update owner directly.
                this._tfHelper.ChangeOwner(OwnerSessionId.toString());
            });
        }
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }
        
        if(!this._tfHelper?.isOwner){
            this._room.Send("ChangeOwner",this._tfHelper.Id);
        }
        
        let dir:Vector3 = Vector3.Normalize(this.transform.position-coll.transform.position);
        dir = new Vector3(dir.x,0,dir.z);
        let power = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.RunSpeed;                
        this._rigidBody.AddForce(dir*power*100);
    }
}