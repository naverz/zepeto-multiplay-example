import { Collider, Vector3, Rigidbody, Object} from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoPlayer} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import PlayerSync from '../Player/PlayerSync';
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class SoccerBall extends ZepetoScriptBehaviour {
    //It's a soccer ball script that applies a physical collision.
    
    private m_tfHelper:TransformSyncHelper;
    private m_rigidBody:Rigidbody;
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    private Start() {
        this.m_tfHelper = this.GetComponent<TransformSyncHelper>();
        this.m_rigidBody = this.GetComponent<Rigidbody>();
        
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room= room;
            this.room.AddMessageHandler("ChangeOwner"+this.m_tfHelper.Id, (OwnerSessionId) => {
                //If there is a real-time physical conflict, such as a soccer ball, change the update owner directly.
                this.m_tfHelper.ChangeOwner(OwnerSessionId.toString());
            });
        }
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){            
            return;
        }
        if(!this.m_tfHelper?.isOwner){
            this.multiplay.Room.Send("ChangeOwner",this.m_tfHelper.Id);
        }
        
        let dir:Vector3 = Vector3.Normalize(this.transform.position-coll.transform.position);
        dir = new Vector3(dir.x,0,dir.z);
        let power = coll.transform.GetComponent<PlayerSync>().zepetoPlayer.character.RunSpeed;                
        this.m_rigidBody.AddForce(dir*power*100);
    }
}