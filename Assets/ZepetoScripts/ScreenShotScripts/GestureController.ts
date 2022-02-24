import { AnimationClip, WaitForSeconds } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class GestureController extends ZepetoScriptBehaviour {

    public gestureListButtons: Button[];
    public gestureClips: AnimationClip[];

    Start() {
        for (let i = 0; i < this.gestureClips.length; ++i) {
            this.gestureListButtons[i].onClick.AddListener(() => {
                const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
                character.SetGesture(this.gestureClips[i]);
                this.StartCoroutine(this.StopCharacterGesture(this.gestureClips[i].length - 0.3));
            });
        }
    }

    *StopCharacterGesture(length:number) {
        yield new WaitForSeconds(length);
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        character.CancelGesture();
    }
}