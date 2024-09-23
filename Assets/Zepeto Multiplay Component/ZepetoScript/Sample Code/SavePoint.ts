import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Quaternion, GameObject, Object} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import FallChecking from './FallChecking';


export default class SavePoint extends ZepetoScriptBehaviour {
    //This is an example of a save point. 
    //This script changes the savepoint to this position when my character is triggered and destroys the savepoint object.
    
    @SerializeField() private _fallCheckObject : GameObject;
    @SerializeField() private _isDestroyable : boolean = true;
    private _fallCheck : FallChecking;
    
    Start() {    
        this._fallCheck = this._fallCheckObject?.GetComponent<FallChecking>();
        if(!this._fallCheck)
            console.warn("Does not have FallChecking Script");
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }

        this._fallCheck.spawnPositon = this.transform.position;
        if(this._isDestroyable)
            Object.Destroy(this.gameObject);
    }

}