import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Object, Coroutine} from 'UnityEngine'
import * as UnityEngine from "UnityEngine";
import {ZepetoCharacter, ZepetoPlayers} from 'ZEPETO.Character.Controller';

export default class GestureTrigger extends ZepetoScriptBehaviour {
    //A script that plays gestures when a Zepeto character is triggered.
    
    @SerializeField() private _exGestures: UnityEngine.AnimationClip[] = [];
    private _gestureCoroutine:Coroutine;
    
    //Gesture testcode
    private OnTriggerEnter(coll: Collider) {
        const localCharacter = ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character;
        if(coll != localCharacter?.GetComponent<Collider>())
            return;
        
        this._gestureCoroutine = this.StartCoroutine(this.StartGesture(localCharacter));
    }
    
    private OnTriggerExit(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>())
            return;
        
        this.StopCoroutine(this._gestureCoroutine);
    }

    private* StartGesture(localCharacter: ZepetoCharacter) {
        let i=0;
        while(true) {
            i = i >= this._exGestures.length - 1 ? 0 : i + 1;
            localCharacter.SetGesture(this._exGestures[i]);
            yield new UnityEngine.WaitForSeconds(this._exGestures[i].length);
            yield new UnityEngine.WaitForSeconds(3);
        }
    }

}