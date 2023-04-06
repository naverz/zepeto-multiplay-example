import {Animator, Camera, GameObject, HumanBodyBones, Quaternion, Renderer, Transform, Vector3} from 'UnityEngine';
import {ZepetoPlayer, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import IKController from './IKController';
import ScreenShotController from './ScreenShotController';
import SelfieCamera from './SelfieCamera';

export default class ScreenShotModeManager extends ZepetoScriptBehaviour {
    
    private localPlayer: ZepetoPlayer;
    private iKController: IKController;

    public screenShotController: GameObject;
    private screenShot: ScreenShotController;

    public selfieCameraPrefab: GameObject;
    private selfieCamera: Camera;
    private zepetoCamera: Camera;

    public selfieStickPrefab: GameObject;
    private selfieStick: GameObject;

    // Data
    private playerLayer: number = 21;

    Start() {
        this.screenShot = this.screenShotController.GetComponent<ScreenShotController>();
        
        // Caching objects related to the Zepeto Local player
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.localPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
            this.zepetoCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;

            if(this.localPlayer.character.gameObject.layer != this.playerLayer) {
                this.localPlayer.character.GetComponentsInChildren<Transform>().forEach((characterObj) => {
                    characterObj.gameObject.layer = this.playerLayer;
                });
            }            
        });
    }

    // Proceed with the specified settings when entering screenshot mode. 
    public StartScreenShotMode() {
        // 1. IK Settings
        this.selfieCamera = GameObject.Instantiate<GameObject>(this.selfieCameraPrefab).GetComponent<Camera>();

        let character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        let target = this.selfieCamera;
  
        // 2. SelfieCamera setting
        let selfieCamera: SelfieCamera = target.GetComponent<SelfieCamera>();
        selfieCamera.InitSetting(character.gameObject.transform);
        
        let grip = selfieCamera.GetGripObject();
        let playerAnimator = this.localPlayer.character.gameObject.GetComponentInChildren<Animator>();
        this.iKController = playerAnimator.gameObject.AddComponent<IKController>();
        this.iKController.SetTargetAndGrip(target.transform, grip.transform);

        // 3. Fix the selfie stick on the character's right hand
        this.selfieStick = GameObject.Instantiate<GameObject>(this.selfieStickPrefab);
        
        const rightHand = this.localPlayer.character.ZepetoAnimator.GetBoneTransform(HumanBodyBones.RightHand);
        this.selfieStick.transform.parent = rightHand;
        this.selfieStick.transform.localPosition = Vector3.zero;
        this.selfieStick.transform.localRotation = Quaternion.Euler(Vector3.zero);
        this.selfieStick.GetComponentInChildren<Renderer>().gameObject.layer = this.playerLayer;
        
        // 4. Initialize the zepetoCamera
        this.SetZepetoCameraMode();
    }

   
    // Initialize the camera settings when exiting the screenshot mode.
    public ExitScreenShotMode(isThirdPersonView: boolean) {
        if(this.selfieCamera != null) {
            GameObject.Destroy(this.selfieCamera.gameObject);
        }

        if(!isThirdPersonView) {
            // Delete the selfie camera
            // Disable IK Pass
            this.SetIKPassActive(false);
            // Activate ZEPETO Camera
            this.zepetoCamera.gameObject.SetActive(true);
        }
    }

    public GetPlayerLayer(): number {
        return this.playerLayer;
    }
    // Return Selfie Camera
    public GetSelfieCamera(): Camera {
        return this.selfieCamera;
    }
    // Return ZEPETO Camera
    public GetZepetoCamera(): Camera {
        return this.zepetoCamera;
    }

    // Decide whether to enable the selfie camera
    public SetSelfieCameraActive(active: boolean) {
        this.selfieCamera.gameObject.SetActive(active);
    }

    // Decide whether to apply IKPass
    public SetIKPassActive(active: boolean) {
        this.iKController.SetIKWeightActive(active);
        //Selfie stick is enable/disable at the same time IK controller is used in selfie mode. 
        this.selfieStick.SetActive(active);
    }

    // Functions for camera setup
    SetSelfieCameraMode() {
        //Disable the existing ZEPETO Camera
        this.zepetoCamera.gameObject.SetActive(false);
        // Enable Selfie Camera
        this.SetSelfieCameraActive(true);
        // Enabling IKPass for Selfie Pose Settings
        this.SetIKPassActive(true); 
        //Change the camera for screenshots to the selfie camera
        this.screenShot.SetScreenShotCamera(this.selfieCamera);
        // Enable Selfie Stick
        this.selfieStick.SetActive(true);
    }

    SetZepetoCameraMode() {
        //Activate the current ZEPETO camera
        this.zepetoCamera.gameObject.SetActive(true);
        // Disable Selfie Camera
        this.SetSelfieCameraActive(false);
        //Disable IKPass to stop posing for selfies
        this.SetIKPassActive(false);
        //Change the active camera to the ZEPETO camera
        this.screenShot.SetScreenShotCamera(this.zepetoCamera);
        // Disable the selfie stick
        this.selfieStick.SetActive(false);
    }
}
