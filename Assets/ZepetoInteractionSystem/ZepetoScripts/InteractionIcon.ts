import { Camera, Canvas, Collider, GameObject, HumanBodyBones, Quaternion, Random, Transform, Object, Vector3 } from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { UnityAction, UnityEvent } from "UnityEngine.Events";
import { ZepetoScriptableObject, ZepetoScriptBehaviour } from "ZEPETO.Script";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import {RoomData} from "ZEPETO.Multiplay";
import {Delegate, Action$1} from "System";

export default class InteractionIcon extends ZepetoScriptBehaviour {
    /* Icon */
    @Header("[Icon]")
    @SerializeField() private prefIconCanvas: GameObject;
    @SerializeField() private iconPosition: Transform;
    
    /* Unity Event */    
    @Header("[Unity Event]")
    public OnClickEvent:UnityEvent;
    public OnTriggerEnterEvent:UnityEvent;
    public OnTriggerExitEvent:UnityEvent;

    private _button: Button;
    private _canvas: Canvas;    
    private _cachedWorldCamera : Camera;
    private _isIconActive : boolean = false;
    private _isDoneFirstTrig : boolean = false;
    
    
    private Update(){
        if(this._isDoneFirstTrig && this._canvas?.gameObject.activeSelf)
            this.UpdateIconRotation();
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponent<Collider>()){
            return;
        }
        
        this.ShowIcon();
    }

    private OnTriggerExit(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponent<Collider>()){
            return;
        }
        
        this.HideIcon();
    }
    
    public ShowIcon(){
        if(!this._isDoneFirstTrig){
            this.CreateIcon();
            this._isDoneFirstTrig = true;
        }
        else
            this._canvas.gameObject.SetActive(true);
        this._isIconActive = true;
    }
    
    public HideIcon(){
        this._canvas?.gameObject.SetActive(false);
        this._isIconActive = false;
    }

    private CreateIcon(){
        if (this._canvas === undefined) {
            const canvas = GameObject.Instantiate(this.prefIconCanvas, this.iconPosition) as GameObject;
            this._canvas = canvas.GetComponent<Canvas>();
            this._button = canvas.GetComponentInChildren<Button>();
            this._canvas.transform.position = this.iconPosition.position;
        }
        this._cachedWorldCamera = Object.FindObjectOfType<Camera>();
        this._canvas.worldCamera = this._cachedWorldCamera;

        this._button.onClick.AddListener(()=>{
            this.OnClickIcon();
        });
    }
    
    private UpdateIconRotation() {
        this._canvas.transform.LookAt(this._cachedWorldCamera.transform);
    }

    private OnClickIcon() {
        this.OnClickEvent?.Invoke();
    }
}