import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import {Object, Random, Time, Vector3, WaitForSeconds} from 'UnityEngine';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class GhostMove extends ZepetoScriptBehaviour {
    //It's a random-moving Ghost npc script.

    @SerializeField() private moveSpeed:number = 5;
    private _tfHelper:TransformSyncHelper;
    private _targetPos:Vector3 = Vector3.zero;
    
    private Start() {
        this._tfHelper = this.GetComponent<TransformSyncHelper>();
        this._tfHelper.moveSpeed = this.moveSpeed;
        this.StartCoroutine(this.NewGetTargetPos());
    }

    private Update(){
       if(!this._tfHelper.isOwner) 
           return;
       this.transform.position = Vector3.MoveTowards(this.transform.position, this._targetPos, this.moveSpeed * Time.deltaTime);
    }

    private *NewGetTargetPos(){
        while(true){
            if(this._tfHelper.isOwner) {
                this._targetPos = new Vector3(Random.Range(-10, 10), 0.5, Random.Range(-10, 10))
                this.transform.LookAt(this._targetPos);
            }
            yield new WaitForSeconds(5);
        }
    }
    
}