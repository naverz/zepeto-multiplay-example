import { Camera, CameraClearFlags, Color, GameObject, RenderTexture } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldContent } from 'ZEPETO.World';
import UIController from './UIController';

export default class ScreenShotController extends ZepetoScriptBehaviour {
    
    // 스크린샷 촬영에 사용되는 카메라
    private camera: Camera;

    // Render Texture에 설정된 1920 x 1080 size 사용 
    public renderTexture: RenderTexture;

    // 투명 배경 촬영용 background canvas
    public backgroundCanvas: GameObject;
    public uiControllerObject:GameObject;
    private uiController:UIController;
    public feedMessage: string;
    Awake(){
        this.uiController = this.uiControllerObject.GetComponent<UIController>();
    }

    // 스크린샷을 촬영할 카메라를 변경하는 함수
    public SetScreenShotCamera(camera: Camera) {
        this.camera = camera;
    }

    // onclick 함수 - 스크린샷 촬영 버튼
    public TakeScreenShot(isBackgroundOn: boolean) {
        if (isBackgroundOn) {
            this.TakeScreenShotWithBackground();
        } else {
            this.TakeScreenShotWithoutBackground();
        }
    }

    // onClick 함수 - 스크린샷 결과화면의 저장 버튼
    public SaveScreenShot() {
        //스크린샷 저장
        ZepetoWorldContent.SaveToCameraRoll(this.renderTexture, (result: boolean) => { console.log(`${result}`) });
    }
    // onClick 함수 - 스크린샷 결과화면의 공유 버튼 
    public ShareScreenShot() {
        ZepetoWorldContent.Share(this.renderTexture, (result: boolean) => { console.log(`${result}`) });
    }

    // onClick 함수 - 스크린샷 결과화면의 피드생성 버튼
    public CreateFeedScreenShot() {
        ZepetoWorldContent.CreateFeed(this.renderTexture, this.feedMessage, (result: boolean) => {
            this.uiController.ShowCreateFeedResult(result);
        });
    }

    TakeScreenShotWithBackground() {
        // 1. 타겟 텍스처를 지정하고 카메라를 렌더합니다.
        this.camera.targetTexture = this.renderTexture;
        this.camera.Render();
        // 2.기존 설정으로 돌려놓습니다.
        this.camera.targetTexture = null;
    }

    TakeScreenShotWithoutBackground() {
        // 백그라운드 캔버스를 스크린샷을 찍는 동안 비활성화 시킵니다. 
        this.backgroundCanvas.gameObject.SetActive(false);

        // 1. 타겟 텍스처를 지정하고 스크린샷 이전 카메라 FLag,Color값을 저장합니다.
        this.camera.targetTexture = this.renderTexture;
        let preClearFlags: CameraClearFlags = this.camera.clearFlags;
        let preBackgroundColor: Color = this.camera.backgroundColor;

        // 2. 카메라의 배경을 solidColor로 채우고, background Color를 투명하게 만듭니다.
        this.camera.clearFlags = CameraClearFlags.SolidColor;
        this.camera.backgroundColor = new Color(0, 0, 0, 0);

        // 3. 카메라를 렌더합니다.
        this.camera.Render();

        // 4. 기존 설정을 되돌립니다.        
        this.camera.backgroundColor = preBackgroundColor;
        this.camera.clearFlags = preClearFlags;
        this.camera.targetTexture = null;

        // 백그라운드 캔버스를 스크린샷을 찍는 동안 다시 활성화 시킵니다. 
        this.backgroundCanvas.gameObject.SetActive(true);
    }
}