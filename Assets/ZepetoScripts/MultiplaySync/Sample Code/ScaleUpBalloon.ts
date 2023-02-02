import { Collider, Vector3, Rigidbody, Object, Time} from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoPlayer} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import PlayerSync from '../Player/PlayerSync';
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class ScaleUpBalloon extends ZepetoScriptBehaviour {
    // Sample of increasing balloon size when triggered enter
    @SerializeField() private targetScaleMultipler:number = 1.5;
    @SerializeField() private scaleUpSpeed:number = 2;
    @SerializeField() private resetSizeOnOtherPlayer: boolean = true;

    private m_tfHelper:TransformSyncHelper;
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    private TargetScale:Vector3 = Vector3.one;
    
    private Start() {
        this.m_tfHelper = this.GetComponent<TransformSyncHelper>();
        this.m_tfHelper.scaleUpSpeed = this.scaleUpSpeed;
        
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room= room;
            this.room.AddMessageHandler("ChangeOwner"+this.m_tfHelper.Id, (OwnerSessionId) => {
                this.m_tfHelper.ChangeOwner(OwnerSessionId.toString());
                if(this.resetSizeOnOtherPlayer){
                    this.TargetScale = Vector3.one;
                    this.transform.localScale = this.TargetScale;
                }
            });
        }
    }
    
    private Update(){
        if(!this.m_tfHelper.isOwner) 
            return;
        
        if(this.transform.localScale != this.TargetScale)
            this.transform.localScale = Vector3.MoveTowards(this.transform.localScale, this.TargetScale, Time.deltaTime * this.scaleUpSpeed);
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){            
            return;
        }
        if(!this.m_tfHelper?.isOwner){
            this.room.Send("ChangeOwner",this.m_tfHelper.Id);
        }
        
        this.TargetScale = this.transform.localScale * this.targetScaleMultipler;
    }
    
}