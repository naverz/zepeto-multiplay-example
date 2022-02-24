import { Canvas, GameObject, Screen, Rect, RectTransform, Resources, WaitForSeconds, YieldInstruction, Sprite } from 'UnityEngine';
import { Button, Image, Text } from 'UnityEngine.UI'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ScreenShotController from './ScreenShotController';
import ScreenShotModeManager from './ScreenShotModeManager';

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

    /* Gesture */
    @Header("Gesture")
    public gestureButton: Button;
    public gestureExitButton: Button;
    public gestureListView: GameObject;

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

    LAYER = {
        everything: -1,
        nothing: 0,
        UI: 5,
    };

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
        this.gestureListView.gameObject.SetActive(false);
        
        this.screenShot = this.screenShotModeModule.GetComponent<ScreenShotController>();
        this.screenShotModeManager = this.screenShotModeModule.GetComponent<ScreenShotModeManager>();
        this.playerLayer = this.screenShotModeManager.GetPlayerLayer();

        this.viewChangeImage = this.viewChangeButton.GetComponent<Image>();
        this.backgroundOnOffImage = this.backgroundOnOffButton.GetComponent<Image>();
        
    }

    Start() {

        // SafeArea 설정
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
         *  1. Btn: 스크린샷 모드 선택 - 스크린샷 모드로 설정하고, 제페토 카메라를 디폴트로 활성화합니다.
         *  2. Btn: 뷰 전환 - 현재 설정에 따라 1인칭/3인칭 카메라를 전환합니다.
         *  3. Btn: 백그라운드 ON/OFF - 백그라운드를 ON/OFF하는 버튼입니다.
         *  4. Btn: 스크린샷 모드 종료 - 스크린샷 모드를 나갑니다.
         *  5. Btn: 스크린샷 촬영 - 스크린샷을 촬영하고 스크린샷 결과 화면을 띄웁니다.
         */
        
        // 1. Btn: 스크린샷 모드 선택
        this.screenShotModeButton.onClick.AddListener(() => {
            this.screenShotModeButton.gameObject.SetActive(false);
            this.screenShotPanel.gameObject.SetActive(true);

            // 처음에는 기본 제페토 카메라 뷰로 설정
            this.isThirdPersonView = true;
            this.backgroundCanvas.worldCamera = this.screenShotModeManager.GetZepetoCamera();
            this.screenShotModeManager.StartScreenShotMode();
        });


        // 2. Btn: 뷰 전환
        this.viewChangeButton.onClick.AddListener(() => {
            if (this.isThirdPersonView) {
                this.viewChangeImage.sprite = this.selfiViewSprite;
                this.backgroundCanvas.worldCamera = this.screenShotModeManager.GetSelfieCamera();
                this.screenShotModeManager.SetSelfieCameraMode();
                this.gestureButton.gameObject.SetActive(false);
                this.gestureListView.gameObject.SetActive(false);
                this.isThirdPersonView = false;
            } else {
                this.viewChangeImage.sprite = this.thirdPersonViewSprite;
                this.backgroundCanvas.worldCamera = this.screenShotModeManager.GetZepetoCamera();
                this.screenShotModeManager.SetZepetoCameraMode();
                this.gestureButton.gameObject.SetActive(true);
                this.isThirdPersonView = true;
            }
        });


        // 3. Btn: 백그라운드 ON/OFF
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

        // 4. Btn: 스크린샷 모드 종료
        this.screenShotModeExitButton.onClick.AddListener(() => {
            if (!this.isBackgroundOn) {
                this.SetBackgroundActive(true);
                this.isBackgroundOn = true;
            }
            this.screenShotModeButton.gameObject.SetActive(true);
            this.screenShotPanel.gameObject.SetActive(false);
            this.gestureButton.gameObject.SetActive(true);
            this.screenShotModeManager.ExitScreenShotMode(this.isThirdPersonView);
        });

        // 5. Btn: 스크린샷 촬영
        this.shootScreenShotButton.onClick.AddListener(() => {
            // 스크린샷 촬영 
            this.screenShot.TakeScreenShot(this.isBackgroundOn);
            // 스크린샷 결과 화면 활성화
            this.screenShotResultBackground.gameObject.SetActive(true);
            this.screenShotResultPanel.gameObject.SetActive(true);
            // 스크린샷 피드 버튼 활성화
            this.createFeedButton.gameObject.SetActive(true);
        });

        /** Screenshot Result 
         *  1. Btn: 스크린샷 저장 - 스크린샷을 갤러리에 저장합니다. 
         *  2. Btn: 스크린샷 공유 - 스크린샷을 공유할 수 있는 기능입니다.
         *  3. Btn: 피드 올리기 - 피드에 올리는 기능입니다.
         *  4. Btn: 스크린샷 결과 화면 종료 - 스크린샷 결과 화면을 닫습니다.
        */

        // 1. Btn: 스크린샷 저장 
        this.saveButton.onClick.AddListener(() => {
            this.screenShot.SaveScreenShot();
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.screenShotSaveCompleted));
        });

        // 2. Btn: 스크린샷 공유
        this.shareButton.onClick.AddListener(() => {
            this.screenShot.ShareScreenShot();
        });

        // 3. Btn: 피드 올리기
        this.createFeedButton.onClick.AddListener(() => {
            this.screenShot.CreateFeedScreenShot();
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedUploading));
        });

        // 4. Btn: 스크린샷 결과 화면 종료
        this.screenShotResultExitButton.onClick.AddListener(() => {
            this.screenShotResultBackground.gameObject.SetActive(false);
            this.screenShotResultPanel.gameObject.SetActive(false);
        });

        /** Gesture 
         *  1. Btn: Gesture - 제스처 리스트뷰를 엽니다.
         *  2. Btn: Gesture Exit - 제스처 리스트뷰를 닫습니다.
         */

        // 1. Btn: Gesture
        this.gestureButton.onClick.AddListener(() => {
            this.gestureListView.SetActive(true);
        });
        // 2. Btn: Gesture Exit
        this.gestureExitButton.onClick.AddListener(() => {
            this.gestureListView.SetActive(false);
        })

    }
    // 스크린샷 결과 화면을 띄웁니다
    public ShowCreateFeedResult(result: Boolean) {
        if (result) {
            this.createFeedButton.gameObject.SetActive(false);
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedCompleted));
        }
        else {
            this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedFailed));
        }
    }

    // 스크린샷 결과 화면에서 저장, 피드 올리기 시 토스트 메시지를 띄웁니다.
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

    //백그라운드 게임오브젝트의 MeshRenderer를 활성화/비활성화 합니다.
    SetBackgroundActive(active: boolean) {
        // 백그라운드 캔버스(체크무늬)는 비활성화/활성화
        if (active) {
            this.backgroundCanvas.gameObject.SetActive(!active);
            //Layer 설정 Everything
            this.screenShotModeManager.GetSelfieCamera().cullingMask = this.LAYER.everything;
            this.screenShotModeManager.GetZepetoCamera().cullingMask = this.LAYER.everything;
        } else {
            this.backgroundCanvas.gameObject.SetActive(!active);
            //Layer 설정을 Nothing으로 바꾼 후 Player,UI Layer만 포함
            this.screenShotModeManager.GetSelfieCamera().cullingMask = this.LAYER.nothing | 1 << this.playerLayer | 1 << this.LAYER.UI;
            this.screenShotModeManager.GetZepetoCamera().cullingMask = this.LAYER.nothing | 1 << this.playerLayer | 1 << this.LAYER.UI;
        }
    }
}

