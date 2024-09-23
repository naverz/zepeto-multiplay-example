import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Object } from 'UnityEngine'
import { ZepetoScreenTouchpad } from 'ZEPETO.Character.Controller';
import UIController from './UIController';


export default class UIControllerTracker extends ZepetoScriptBehaviour {

    private _UiController: UIController;
    public screenTouchPad: ZepetoScreenTouchpad;
    
    //This function runs everytime the V-Pad is enabled
    OnEnable()
    {
        this._UiController = Object.FindObjectOfType<UIController>();
        this.screenTouchPad = this.gameObject.GetComponentInChildren<ZepetoScreenTouchpad>()
        this._UiController.InitScreenTouchPadListener(this.screenTouchPad)  
    }
}