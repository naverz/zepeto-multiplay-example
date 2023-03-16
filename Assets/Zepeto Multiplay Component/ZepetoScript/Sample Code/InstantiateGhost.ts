import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import { Collider, Vector3, Quaternion } from 'UnityEngine';
import MultiplayManager from '../Common/MultiplayManager';
import {ZepetoPlayers} from "ZEPETO.Character.Controller";

export default class InstantiateGhost extends ZepetoScriptBehaviour {
    @SerializeField() private _prefabName:string = "Ghost(TransformSync)"
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }

        MultiplayManager.instance.Instantiate(this._prefabName,"",Vector3.zero, Quaternion.identity);
    }
}