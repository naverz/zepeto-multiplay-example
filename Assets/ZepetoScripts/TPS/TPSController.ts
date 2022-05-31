import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoPlayers, ZepetoCharacter, ZepetoScreenTouchpad, ZepetoCamera } from 'ZEPETO.Character.Controller';
import { Vector3, Time, Quaternion} from 'UnityEngine';
import {ZepetoInputControl} from 'RootNamespace';

export default class TPSController extends ZepetoScriptBehaviour {
    private zepetoScreenPad: ZepetoScreenTouchpad;
    private myCharacter : ZepetoCharacter;
    private myInputControl : ZepetoInputControl;
    private myCamera : ZepetoCamera;

    Awake() {
        this.myInputControl = new ZepetoInputControl();
    }

    Start() {
        this.myInputControl.Enable();
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.myCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera;
            this.myCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            this.zepetoScreenPad = ZepetoPlayers.instance.gameObject.GetComponentInChildren<ZepetoScreenTouchpad>();
            this.zepetoScreenPad.OnDragEvent.AddListener((deltaVector)=>{
                console.log(`[OnDragEvent] : ${deltaVector.ToString()}`);
                //The rotation of the camera is corrected according to the rotation of the character.
                ZepetoPlayers.instance.ZepetoCamera.transform.RotateAround(this.myCharacter.transform.position,
                    Vector3.up, deltaVector.x * Time.deltaTime * 80);
            });
        });
    }

    Update() {
        if(null == this.myCharacter || null == this.myCamera)
        {
            return;
        }
        var lookAxisRot = Quaternion.LookRotation(this.myCamera.cameraParent.forward);
        var projRot = Vector3.ProjectOnPlane(lookAxisRot.eulerAngles, Vector3.right);
        // Match the rotation of the character with the forward direction of the camera.
        this.myCharacter.gameObject.transform.rotation = Quaternion.Euler(projRot);
    }
}