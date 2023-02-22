import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Quaternion, GameObject, Object} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import PlayerSync from '../Player/PlayerSync';
import FallChecking from './FallChecking';


export default class SavePoint extends ZepetoScriptBehaviour {
    //This is an example of a save point. 
    //This script changes the savepoint to this position when my character is triggered and destroys the savepoint object.
    
    @SerializeField() private fallCheckObject : GameObject;
    @SerializeField() private m_fallCheck : FallChecking;
    
    Start() {    
        this.m_fallCheck = this.fallCheckObject?.GetComponent<FallChecking>();
        if(!this.m_fallCheck)
            console.warn("Does not have FallChecking Script");
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.transform.GetComponent<PlayerSync>()?.isLocal){
            return;
        }
        this.m_fallCheck.spawnPositon = this.transform.position;
        Object.Destroy(this.gameObject);
    }

}