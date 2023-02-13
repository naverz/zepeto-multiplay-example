import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Button, RawImage, Text, Toggle } from 'UnityEngine.UI';
import { LocalPlayer, ZepetoCharacter, ZepetoPlayers, ZepetoScreenTouchpad } from 'ZEPETO.Character.Controller';
import { OfficialContentType, Content } from 'ZEPETO.World';
import { Object, GameObject, Transform } from 'UnityEngine';
import GestureLoader from './GestureLodaer';
import Thumbnail from './Thumbnail';

export default class UIController extends ZepetoScriptBehaviour {
    
    @SerializeField() private _closeButton : Button;
    @SerializeField() private _typeToggleGroup : Toggle[];

    private _gestureLodaer: GestureLoader;
    private _myCharacter: ZepetoCharacter;
        
    Start() {
        this._gestureLodaer = Object.FindObjectOfType<GestureLoader>();
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._myCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;

            // If click the touchpad, cancel the gesture
            Object.FindObjectOfType<ZepetoScreenTouchpad>().OnPointerDownEvent.AddListener(() => {
                this.StopGesture();
            });

            // If click the close button, cancel the gesture
            this._closeButton.onClick.AddListener(() => {
                this.StopGesture();
            });
        });
        
        // UI Listener
        this._typeToggleGroup[0].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.All);
        });
        this._typeToggleGroup[1].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.Gesture);
        });
        this._typeToggleGroup[2].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.Pose);
        });
        this._typeToggleGroup[3].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.GestureDancing);
        });

    }

    // Category Toggle UI Set
    private SetCategoryUI(category: OfficialContentType) {
        
        if (category == OfficialContentType.All) {
            this._gestureLodaer.thumbnails.forEach((Obj) => {
                Obj.SetActive(true);
            });
        }   else {
            for (let i = 0; i < this._gestureLodaer.thumbnails.length; i++) {
                const content = this._gestureLodaer.thumbnails[i].GetComponent<Thumbnail>().content;
                if (content.Keywords.includes(category)) {
                    this._gestureLodaer.thumbnails[i].SetActive(true);
                } else {
                    this._gestureLodaer.thumbnails[i].SetActive(false);
                }
            }
        }
    }
    
    private StopGesture() {
        this._myCharacter.CancelGesture();
    }
}