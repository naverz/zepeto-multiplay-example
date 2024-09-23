import { Collider, Vector3, Rigidbody, Object, Time} from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoPlayer, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class ScaleUpBalloon extends ZepetoScriptBehaviour {
    // Sample of increasing balloon size when triggered enter
    @SerializeField() private _targetScaleMultipler:number = 1.5;
    @SerializeField() private _scaleUpSpeed:number = 2;
    @SerializeField() private _resetSizeOnOtherPlayer: boolean = true;

    private _tfHelper:TransformSyncHelper;
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _targetScale:Vector3 = Vector3.one;
    
    private Start() {
        this._tfHelper = this.GetComponent<TransformSyncHelper>();
        this._tfHelper.scaleUpSpeed = this._scaleUpSpeed;
        
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room= room;
            this._room.AddMessageHandler("ChangeOwner"+this._tfHelper.Id, (ownerSessionId) => {
                this._tfHelper.ChangeOwner(ownerSessionId.toString());
                if(this._resetSizeOnOtherPlayer){
                    this.transform.localScale = Vector3.one;
                    this._targetScale = Vector3.one * this._targetScaleMultipler;
                }
            });
        }
    }
    
    private Update(){
        if(!this._tfHelper.isOwner) 
            return;
        
        if(this.transform.localScale != this._targetScale)
            this.transform.localScale = Vector3.MoveTowards(this.transform.localScale, this._targetScale, Time.deltaTime * this._scaleUpSpeed);
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }
        
        if(!this._tfHelper?.isOwner){
            this._room.Send("ChangeOwner",this._tfHelper.Id);
        }
     
        this._targetScale = this.transform.localScale * this._targetScaleMultipler;
    }
    
}