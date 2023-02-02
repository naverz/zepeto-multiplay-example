import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Object} from 'UnityEngine'
import PlayerSync from '../Player/PlayerSync';

export default class AdditionalSpeed extends ZepetoScriptBehaviour {
    //Script that increases the speed when the Zepeto character steps on the trigger.
    
    @SerializeField() private additionalRunSpeed:number = 10;
    @SerializeField() private additionalWalkSpeed:number = 10;
    @SerializeField() private additionalJumpPower:number = 10;
    
    private OnTriggerEnter(coll: Collider) {
        if(!coll.GetComponent<PlayerSync>()?.isLocal) {
            return;
        }
        let zepCharacter = coll.GetComponent<PlayerSync>().zepetoPlayer.character;
        zepCharacter.additionalRunSpeed = this.additionalRunSpeed;
        zepCharacter.additionalWalkSpeed = this.additionalWalkSpeed;
        zepCharacter.additionalJumpPower = this.additionalJumpPower;
    }
    
    private OnTriggerExit(coll: Collider) {
        if(!coll.GetComponent<PlayerSync>()?.isLocal) {
            return;
        }
        let zepCharacter = coll.GetComponent<PlayerSync>().zepetoPlayer.character;
        zepCharacter.additionalRunSpeed = 0;
        zepCharacter.additionalWalkSpeed = 0;
        zepCharacter.additionalJumpPower = 0;
    }
}