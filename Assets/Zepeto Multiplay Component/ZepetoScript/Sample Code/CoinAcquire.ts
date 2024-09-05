import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import {Collider, Vector3, Rigidbody, Object, Quaternion} from 'UnityEngine';
import {ZepetoPlayer, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../Transform/TransformSyncHelper';
import MultiplayManager from '../Common/MultiplayManager';

export default class CoinAcquire extends ZepetoScriptBehaviour {
    //A script that triggers the Zepeto character to acquire coins, destroy coins, or move them to new coordinates.
    
    @SerializeField() private useCoinRandomRespawn:boolean = true;
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _tfHelper:TransformSyncHelper;

    private Start() {
        this._tfHelper = this.GetComponent<TransformSyncHelper>();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room= room;
            this._room.AddMessageHandler("CoinAcquired"+this._tfHelper.Id, (AcquiredSessionId:string) => {
                if(this.useCoinRandomRespawn)
                    this.ChangeRandomPosition();
                else
                    this.DestroyCoin();
            });
        }
    }
 
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }
        
        //In multi-play, if you want to create a competitive game by winning coins, add the number of coins to the player state.
        this._multiplay.Room.Send("CoinAcquired", this._tfHelper.Id);
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