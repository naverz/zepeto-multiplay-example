import {Collider, Vector3, Quaternion, Object} from 'UnityEngine';
import {CharacterState, SpawnInfo, ZepetoCharacter, ZepetoPlayers, ZepetoPlayer} from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Room} from "ZEPETO.Multiplay";
import {ZepetoWorldMultiplay} from "ZEPETO.World";

export default class FallChecking extends ZepetoScriptBehaviour {
    //It's a script that responds when the Zepeto character falls.
    public spawnPositon:Vector3;
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }
        
        const localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        localCharacter.Teleport(this.spawnPositon,Quaternion.identity);
    }
}