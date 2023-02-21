import { Canvas, GameObject, Screen, Rect, RectTransform, Resources, WaitForSeconds, YieldInstruction, Sprite } from 'UnityEngine';
import { Button, Image, Text } from 'UnityEngine.UI'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ScreenShotController from './ScreenShotController';
import ScreenShotModeManager from './ScreenShotModeManager';

export enum LAYER  {
    everything = -1,
    nothing = 0,
    UI= 5,
};

export default class UIController extends ZepetoScriptBehaviour {
    
    public safeAreaObject: GameObject;
    /* Panels */
    @Header("Panels")
    public zepetoScreenShotCanvas: Canvas;
    public screenShotPanel: Image;
    public screenShotResultPanel: Image;

    /* Screenshot Mode */
    @Header("Screenshot Mode")
    public screenShotModeButton: Button;
    public viewChangeButton: Button;
    public backgroundOnOffButton: Button;
    public shootScreenShotButton: Button;
    public screenShotModeExitButton: Button;
    private viewChangeImage: Image
    private backgroundOnOffImage: Image
    public selfiViewSprite: Sprite;
    public thirdPersonViewSprite: Sprite;
    public backgroundOnSprite: Sprite;
    public backgroundOffSprite: Sprite;

    /* Screenshot Result */
    @Header("Screenshot Result")
    public saveButton: Button;
    public shareButton: Button;
    public createFeedButton: Button;
    public screenShotResultExitButton: Button;
    public screenShotResultBackground: Image;

    /* ToastMessage */
    @Header("Toast Message")
    public toastSuccessMessage: GameObject;
    public toastErrorMessage: GameObject;
    private waitForSecond: YieldInstruction;

    /* Camera mode */
    private isThirdPersonView: boolean = false;

    /* Background onoff */
    @Header("Background onoff")
    public backgroundCanvas: Canvas;
    private isBackgroundOn: boolean = true;
    
    /* Custom Class */
    private screenShot: ScreenShotController;
    private screenShotModeManager: ScreenShotModeManager;
    @Header("ScreenShot Mode Module")
    public screenShotModeModule: GameObject;

    /*Player Layer Setting*/
    private playerLayer: number = 0;

    

    // Data
    TOAST_MESSAGE = {
        feedUploading: "Uploading...",
        feedCompleted: "Done",
        feedFailed: "Failed",
        screenShotSaveCompleted: "Saved!"
    };


    Awake() {
        this.isBackgroundOn = true;
        this.zepetoScreenShotCanvas.sortingOrder = 1;
        this.waitForSecond = new WaitForSeconds(1);

        this.screenShotPanel.gameObject.SetActive(false);
        this.backgroundCanvas.gameObject.SetActive(false);
        this.screenShotResultPanel.gameObject.SetActive(false);
        this.screenShotResultBackground.gameObject.SetActive(false);
        
        this.screenShot = this.screenShotModeModule.GetComponent<ScreenShotController>();
        this.screenShotModeManager = this.screenShotModeModule.GetComponent<ScreenShotModeManager>();
        this.playerLayer = this.screenShotModeManager.GetPlayerLayer();

        this.viewChangeImage = this.viewChangeButton.GetComponent<Image>();
        this.backgroundOnOffImage = this.backgroundOnOffButton.GetComponent<Image>();
        
    }

    Start() {

        // SafeArea Settings
        let safeArea: Rect = Screen.safeArea;
        let newAnchorMin = safeArea.position;
        let newAnchorMax = safeArea.position + safeArea.size;
        newAnchorMin.x /= Screen.width;
        newAnchorMax.x /= Screen.width;
        newAnchorMin.y /= Screen.height;
        newAnchorMax.y /= Screen.height;

        let rect = this.safeAreaObject.GetComponent<RectTransform>();
        rect.anchorMin = newAnchorMin;
        rect.anchorMax = newAnchorMax;

        /** Screenshot mode 
         *  1. Btn: Select Screenshot Mode - Set to Screenshot Mode and enable ZEPETO Camera by default.
         *  2. Btn: Switch view - Switch first-person/third-person camera according to current settings.
         *  3. Btn: Background ON/OFF - Button to turn the background on/off .
         *  4. Btn: Exit Screenshot Mode - Exits Screenshot Mode.
         *  5. Btn: Take a screenshot - Take a screenshot and display the screenshot results.
         */
        
        // 1. Btn: Select Screenshot Mode
        this.screenShotModeButton.onClick.AddListener(() => {
            this.screenShotModeButton.gameObject.SetActive(false);
            this.screenShotPanel.gameObject.SetActive(true);

            //Initialize the camera view to the default ZEPETO camera
            this.isThirdPersonView = true;
            this.backgroundCanvas.worldCamera = this.screenShotModeManager.GetZepetoCamera();
            this.screenShotModeManager.StartScreenShotMode();
        });


        // 2. Btn: Switch Views
        this.viewChangeButton.onClick.AddListener(() => {
            if (this.isThirdPersonView) {
                this.viewChangeImage.sprite = this.selfiViewSprite;
                this.backgroundCanvas.worldCamera = this.screenShotModeManager.GetSelfieCamera();
                this.screenShotModeManager.SetSelfieCameraMode();
                this.isThirdPersonView = false;
            } else {
                this.viewChangeImage.sprite = this.thirdPersonViewSprite;
                this.backgroundCanvas.worldCamera = this.screenShotModeManager.GetZepetoCamera();
                this.screenShotModeManager.SetZepetoCameraMode();
                this.isThirdPersonView = true;
            }
        });


        // 3. Btn: Background ON/OFF
        this.backgroundOnOffButton.onClick.AddListener(() => {
            if (this.isBackgroundOn) {
                this.backgroundOnOffImage.sprite = this.backgroundOffSprite;
                this.SetBackgroundActive(!this.isBackgroundOn);
                this.isBackgroundOn = false;
            } else {
                this.backgroundOnOffImage.sprite = this.backgroundOnSprite;
                this.SetBackgroundActive(!this.isBackgroundOn);
                this.isBackgroundOn = true;
            }
        });

        // 4. Btn: Exit Screenshot Mode
        this.screenShotModeExitButton.onClick.AddListener(() => {
            if (!this.isBackgroundOn) {
                this.SetBackgroundActive(true);
                this.isBackgroundOn = true;
            }
            this.screenShotModeButton.gameObject.SetActive(true);
            this.screenShotPanel.gameObject.SetActive(false);
            this.screenShotModeManager.ExitScreenShotMode(this.isThirdPersonView);
        });

        // 5. Btn: Take a screenshot
        this.shootScreenShotButton.onClick.AddListener(() => {
            // Take a screenshot
            this.screenShot.TakeScreenShot(this.isBackgroundOn);
            // Activating the Screenshot Results Screen
            this.screenShotResultBackground.gameObject.SetActive(true);
            this.screenShotResultPanel.gameObject.SetActive(true);
            // Activating the Screenshot Feed Button
            this.createFeedButton.gameObject.SetActive(true);
        });

        /** Screenshot Result 
         *  1. Btn: Save Screenshot - Save the screenshot to the gallery.
         *  2. Btn: Screenshot sharing - The ability to share screenshots.
         *  3. Btn: Upload Feed - The ability to upload to a feed.
         *  4. Btn: Exit Screenshot Results Screen - Close the Screenshot Results screen.
        */

        // 1. Btn: Save Screenshot
        this.saveButton.onClick.AddListener(() => {
            this.screenShot.SaveScreenShot();
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.screenShotSaveCompleted));
        });

        // 2. Btn: Share Screenshots
        this.shareButton.onClick.AddListener(() => {
            this.screenShot.ShareScreenShot();
        });

        // 3. Btn: Upload Feed
        this.createFeedButton.onClick.AddListener(() => {
            this.screenShot.CreateFeedScreenShot();
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedUploading));
        });

        // 4. Btn: Close the Screenshot Results Screen
        this.screenShotResultExitButton.onClick.AddListener(() => {
            this.screenShotResultBackground.gameObject.SetActive(false);
            this.screenShotResultPanel.gameObject.SetActive(false);
        });

    }
    // Displays the screenshot results screen.
    public ShowCreateFeedResult(result: Boolean) {
        if (result) {
            this.createFeedButton.gameObject.SetActive(false);
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedCompleted));
        }
        else {
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedFailed));
        }
    }

    // The screenshot results screen shows a toast message when saving and uploading feeds.
    *ShowToastMessage(text: string) {
        yield this.waitForSecond;
        let toastMessage: GameObject = null;
        if (text == this.TOAST_MESSAGE.feedFailed)
            toastMessage = GameObject.Instantiate<GameObject>(this.toastErrorMessage);
        else
            toastMessage = GameObject.Instantiate<GameObject>(this.toastSuccessMessage);
        toastMessage.transform.SetParent(this.screenShotResultPanel.transform);

        toastMessage.GetComponentInChildren<Text>().text = text;
        GameObject.Destroy(toastMessage, 1);
    }
    //Enables/disables MeshRender for background gameobjects.
    SetBackgroundActive(active: boolean) {
        // Background canvas (checkered pattern) disabled/enabled
        if (active) {
            this.backgroundCanvas.gameObject.SetActive(!active);
            //Layer Settings to Everything
            this.screenShotModeManager.GetSelfieCamera().cullingMask = LAYER.everything;
            this.screenShotModeManager.GetZepetoCamera().cullingMask = LAYER.everything;
        } else {
            this.backgroundCanvas.gameObject.SetActive(!active);
            //Change the Layer setting to only include nothing, player, and UI Layers
            this.screenShotModeManager.GetSelfieCamera().cullingMask = LAYER.nothing | 1 << this.playerLayer | 1 << LAYER.UI;
            this.screenShotModeManager.GetZepetoCamera().cullingMask = LAYER.nothing | 1 << this.playerLayer | 1 << LAYER.UI;
        }
    }
}

