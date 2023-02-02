import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import { Collider, Vector3, Quaternion } from 'UnityEngine';
import PlayerSync from '../Player/PlayerSync';
import MultiplayManager from '../Common/MultiplayManager';

export default class InstantiateChicken extends ZepetoScriptBehaviour {
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }
        MultiplayManager.instance.Instantiate("Chicken(TransformSync)","",Vector3.zero, Quaternion.identity);
    }
}