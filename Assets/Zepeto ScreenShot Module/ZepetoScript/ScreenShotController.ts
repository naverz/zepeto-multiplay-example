import { Camera, CameraClearFlags, Color, GameObject, RenderTexture, WaitForEndOfFrame } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldContent } from 'ZEPETO.World';
import UIController from './UIController';

export default class ScreenShotController extends ZepetoScriptBehaviour {
    
    // Camera used to take screenshots
    private camera: Camera;

    private preClearFlags:CameraClearFlags;
    private preBackgroundColor:Color

    // Use 1920 x 1080 size set in Render Texture
    public renderTexture: RenderTexture;

    // Background canvas for transparent background shooting
    public backgroundCanvas: GameObject;
    public uiControllerObject:GameObject;
    private uiController:UIController;
    public feedMessage: string;
    Awake(){
        this.uiController = this.uiControllerObject.GetComponent<UIController>();
    }

    // Set the camera used to take a screenshot. 
    public SetScreenShotCamera(camera: Camera) {
        this.camera = camera;
    }

    // Onclick Function - Take Screenshot Button
    public TakeScreenShot(isBackgroundOn: boolean) {
        if (isBackgroundOn) {
            this.TakeScreenShotWithBackground();
        } else {
            this.TakeScreenShotWithoutBackground();
        }
    }

    // onClick function - Save button on screenshot result screen
    public SaveScreenShot() {
        //Save Screenshot
        ZepetoWorldContent.SaveToCameraRoll(this.renderTexture, (result: boolean) => { console.log(`${result}`) });
    }
    // onClick function - Share button on screenshot result screen
    public ShareScreenShot() {
        ZepetoWorldContent.Share(this.renderTexture, (result: boolean) => { console.log(`${result}`) });
    }

    // onClick function - Create feed button on screenshot result screen
    public CreateFeedScreenShot() {
        ZepetoWorldContent.CreateFeed(this.renderTexture, this.feedMessage, (result: boolean) => {
            this.uiController.ShowCreateFeedResult(result);
        });
    }

    *RenderTargetTextureWithBackground()
    {
        yield new WaitForEndOfFrame();
        this.camera.Render();
        this.camera.targetTexture = null;
    }

    *RenderTargetTextureWithoutBackground()
    {
        yield new WaitForEndOfFrame();
        this.camera.Render();

        // 4. Revert existing settings 
        this.camera.targetTexture = null;
        this.camera.backgroundColor = this.preBackgroundColor;
        this.camera.clearFlags = this.preClearFlags;

        // 5. Reactivate the background canvas while taking a screenshot
        this.backgroundCanvas.gameObject.SetActive(true);
    }

    private TakeScreenShotWithBackground() {
        // Specify the target texture and render the camera
        this.camera.targetTexture = this.renderTexture;
        this.StartCoroutine(this.RenderTargetTextureWithBackground());

    }

    private TakeScreenShotWithoutBackground() {
        // Disable background canvas while taking screenshots
        this.backgroundCanvas.gameObject.SetActive(false);

        // 1. Specify the target texture and save the camera flag/color values before the screenshot
        this.camera.targetTexture = this.renderTexture;
        this.preClearFlags = this.camera.clearFlags;
        this.preBackgroundColor = this.camera.backgroundColor;

        // 2. Fill the background of the camera with a solid color and make the background color transparent. 
        this.camera.clearFlags = CameraClearFlags.SolidColor;
        this.camera.backgroundColor = new Color(0, 0, 0, 0);

        // 3. Camera Render
        this.StartCoroutine(this.RenderTargetTextureWithoutBackground());

    }
}
