import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Object, Coroutine} from 'UnityEngine'
import * as UnityEngine from "UnityEngine";
import {ZepetoPlayer, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import PlayerSync from '../Player/PlayerSync';

export default class GestureTrigger extends ZepetoScriptBehaviour {
    //A script that plays gestures when a Zepeto character is triggered.
    
    @SerializeField() private m_exGestures: UnityEngine.AnimationClip[] = [];
    private m_gestureCoroutine:Coroutine;
    
    //Gesture testcode
    private OnTriggerEnter(coll: Collider) {
        if(!coll.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.m_gestureCoroutine = this.StartCoroutine(this.gesture(coll.GetComponent<PlayerSync>().zepetoPlayer));
    }
    
    private OnTriggerExit(coll: Collider) {
        if(!coll.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.StopCoroutine(this.m_gestureCoroutine);
    }

    private* gesture(zepetoPlayer: ZepetoPlayer) {
        let i=0;
        while(true) {
            i = i >= this.m_exGestures.length - 1 ? 0 : i + 1;
            zepetoPlayer.character.SetGesture(this.m_exGestures[i]);
            yield new UnityEngine.WaitForSeconds(this.m_exGestures[i].length);
            yield new UnityEngine.WaitForSeconds(3);
        }
    }

}