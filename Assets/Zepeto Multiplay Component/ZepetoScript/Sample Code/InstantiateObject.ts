import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import { Collider, Vector3, Quaternion } from 'UnityEngine';
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import MultiplayManager from '../Common/MultiplayManager';

export default class InstantiateObject extends ZepetoScriptBehaviour {
    @SerializeField() private _prefabName:string = "Ghost(TransformSync)";
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }

        MultiplayManager.instance.Instantiate(this._prefabName, MultiplayManager.instance?.room.SessionId,Vector3.zero, Quaternion.identity);
    }
}