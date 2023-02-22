import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import { Collider, Vector3, Quaternion } from 'UnityEngine';
import PlayerSync from '../Player/PlayerSync';
import MultiplayManager from '../Common/MultiplayManager';

export default class InstantiateGhost extends ZepetoScriptBehaviour {
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }
        MultiplayManager.instance.Instantiate("Ghost(TransformSync)","",Vector3.zero, Quaternion.identity);
    }
}