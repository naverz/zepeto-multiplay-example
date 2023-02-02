import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import {Object, Random, Time, Vector3, WaitForSeconds} from 'UnityEngine';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class GhostMove extends ZepetoScriptBehaviour {
    //It's a random-moving Ghost npc script.

    @SerializeField() private moveSpeed:number = 5;
    private m_tfHelper:TransformSyncHelper;
    private m_targetPos:Vector3 = Vector3.zero;
    
    private Start() {
        this.m_tfHelper = this.GetComponent<TransformSyncHelper>();
        this.m_tfHelper.moveSpeed = this.moveSpeed;
        this.StartCoroutine(this.NewGetTargetPos());
    }

    private Update(){
       if(!this.m_tfHelper.isOwner) 
           return;
       this.transform.position = Vector3.MoveTowards(this.transform.position, this.m_targetPos, this.moveSpeed * Time.deltaTime);
    }

    private *NewGetTargetPos(){
        while(true){
            if(this.m_tfHelper.isOwner) {
                this.m_targetPos = new Vector3(Random.Range(-10, 10), 0.5, Random.Range(-10, 10))
                this.transform.LookAt(this.m_targetPos);
            }
            yield new WaitForSeconds(5);
        }
    }
    
}