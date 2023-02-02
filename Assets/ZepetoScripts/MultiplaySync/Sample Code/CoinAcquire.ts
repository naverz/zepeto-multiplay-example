import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import {Collider, Vector3, Rigidbody, Object, Quaternion} from 'UnityEngine';
import {ZepetoPlayer} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import PlayerSync from '../Player/PlayerSync';
import TransformSyncHelper from '../Transform/TransformSyncHelper';
import MultiplayManager from '../Common/MultiplayManager';

export default class CoinAcquire extends ZepetoScriptBehaviour {
    //A script that triggers the Zepeto character to acquire coins, destroy coins, or move them to new coordinates.
    
    @SerializeField() private useCoinRandomRespawn:boolean = true;
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private m_tfHelper:TransformSyncHelper;

    private Start() {
        this.m_tfHelper = this.GetComponent<TransformSyncHelper>();
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room= room;
            this.room.AddMessageHandler("CoinAcquired"+this.m_tfHelper.Id, (AcquiredSessionId:string) => {
                if(this.useCoinRandomRespawn)
                    this.ChangeRandomPosition();
                else
                    this.DestroyCoin();
            });
        }
    }

    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }
        //In multi-play, if you want to create a competitive game by winning coins, add the number of coins to the player state.
        this.multiplay.Room.Send("CoinAcquired", this.m_tfHelper.Id);
    }
    
    private ChangeRandomPosition(){
        this.transform.position = new Vector3(this.GetRandomInt(10),1,this.GetRandomInt(10));
    }
    
    private DestroyCoin(){
        MultiplayManager.instance.Destroy(this.gameObject);
    }
    
    private GetRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }
}