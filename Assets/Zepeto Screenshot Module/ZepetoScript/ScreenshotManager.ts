import { Color, Coroutine, GameObject, Time, WaitForSeconds, Mathf, Camera } from 'UnityEngine';
import { Button, Image, Text, RawImage } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ScreenshotController from './ScreenshotController';
import ScreenshotUIController from './ScreenshotUIController';

export default class ScreenshotManager extends ZepetoScriptBehaviour {

    private _canEnterOrExit: bool;
    private _isPhoto: bool;
    private _videoTimerText: Text;
    private _originalInputFeedMsg: string;
    private _coRecordingTimer: Coroutine;
    private _screenshotController: ScreenshotController;
    private _screenshotUIController: ScreenshotUIController;

    Awake() {
        this._canEnterOrExit = true;
        this._screenshotController = this.gameObject.GetComponent<ScreenshotController>();
        this._screenshotUIController = this.gameObject.GetComponent<ScreenshotUIController>();
        this._videoTimerText = this._screenshotUIController.VideoTimer.GetComponentInChildren<Text>();
        this.ResultToastButtonSetting(this._screenshotUIController.SimpleResultPanel);
        this.InitialzeScreenshotManager();
    }

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._screenshotController.SetScreenshotCamera(GameObject.Find("ZepetoPlayers").GetComponentInChildren<Camera>());
        });

        this._originalInputFeedMsg = this._screenshotUIController.PreviewInputField.text;
    }

    /* Initialze */

    private InitialzeScreenshotManager() {
        // Button
        this._screenshotUIController.TakePhotoScreenshotButton.onClick.AddListener(() => {
            this.TakePhotoScreenshotButtonAction();
        });

        this._screenshotUIController.TakeVideoScreenshotButton.onClick.AddListener(() => {
            this.TakeVideoScreenshotButtonAction();
        });

        this._screenshotUIController.ExitButton.onClick.AddListener(() => {
            this.ToggleScreenshotUI();
        });

        this._screenshotUIController.PreviewExitButton.onClick.AddListener(() => {
            this._screenshotController.DestroyVideoPlayerComponent(this._screenshotUIController.PreviewVideoRawImage);
            this._screenshotUIController.TogglePreviewRawImage(false);
            this._screenshotUIController.TogglePreviewVideoRawImage(false);
            this._screenshotUIController.PreviewWindow.SetActive(false);
            this._screenshotUIController.PreviewInputField.text = this._originalInputFeedMsg;
        });

        this._screenshotUIController.PreviewUploadButton.onClick.AddListener(() => {
            this.OnClickUploadButton();
        });

        this._screenshotUIController.PreviewSaveButton.onClick.AddListener(() => {
            if (this._isPhoto) {
                this._screenshotController.PhotoSave();
            } else {
                this._screenshotController.VideoSave();
            }
        });

        this._screenshotUIController.PreviewShareButton.onClick.AddListener(() => {
            if (this._isPhoto) {
                this._screenshotController.PhotoShare();
            } else {
                this._screenshotController.VideoShare();
            }
        });

        // Event
        this._screenshotController.OnScreenshotDone.AddListener(() => {
            this._screenshotUIController.ToggleEasyUploadWindow(true);
            this._isPhoto = true;
        });

        this._screenshotController.OnProgressEvent.AddListener(() => {
            this._screenshotUIController.ToggleProgressToastWindow(true);
        });

        this._screenshotController.OnFailEvent.AddListener(() => {
            this.StartCoroutine(this.CoShowToastWindow(false));
        });

        this._screenshotController.OnSuccessEvent.AddListener(() => {
            this.StartCoroutine(this.CoShowToastWindow(true));
        });
    }

    private ResultToastButtonSetting(simpleResultPanel: GameObject) {
        let buttons = simpleResultPanel.GetComponentsInChildren<Button>();

        buttons.forEach(button => {
            switch (button.name) {
                case "ScreenshotEditButton":
                    button.onClick.AddListener(() => {
                        this.OnClickEditButton();
                        this._screenshotUIController.ToggleEasyUploadWindow(false);
                    });
                    break;
                case "ScreenshotUploadButton":
                    button.onClick.AddListener(() => {
                        this.OnClickUploadButton();
                        this._screenshotUIController.ToggleEasyUploadWindow(false);
                    });
                    break;
                case "ScreenshotResultExit":
                    button.onClick.AddListener(() => {
                        this._screenshotUIController.ToggleEasyUploadWindow(false);
                    });
                    break;
                default:
                    break;
            }
        });
    }

    /* OnClick */

    // Screenshot UI on/off
    public ToggleScreenshotUI() {
        if (!this._canEnterOrExit) {
            return;
        }
        this._screenshotUIController.ToggleUI();
    }

    private OnClickUploadButton() {
        if (this._isPhoto) {
            this._screenshotController.PhotoPostToFeed(this._screenshotUIController.PreviewInputField.text);
        }
        else {
            this._screenshotController.VideoPostToFeed(this._screenshotUIController.PreviewInputField.text);
        }
    }

    private OnClickEditButton() {
        this._screenshotUIController.PreviewWindow.SetActive(true);

        if (this._isPhoto) {
            this._screenshotUIController.TogglePreviewRawImage(true);
            this._screenshotUIController.PreviewRawImage.GetComponent<RawImage>().texture = this._screenshotController.ScreenshotRenderTexture;
        } else {
            this._screenshotUIController.TogglePreviewVideoRawImage(true);
            this._screenshotController.PlayPreviewVideo(this._screenshotUIController.PreviewVideoRawImage, 1280, 720);
        }
    }

    // TakePhoto Button
    private TakePhotoScreenshotButtonAction() {
        this._screenshotController.StartTakePhotoScreenshot();
    }

    // TakeVideo Button
    private TakeVideoScreenshotButtonAction() {
        this._isPhoto = false;
        this._screenshotController.ResetVideoRecordingEvent();
        this._screenshotController.OnVideoRecordingStartEvent.AddListener(() => {
            this.StartTimer();
        });
        this._screenshotController.OnVideoRecordingStopEvent.AddListener(() => {
            this.StopTimer();
            this._screenshotUIController.TakePhotoScreenshotButton.interactable = true;
            this._screenshotUIController.ExitButton.interactable = true;
            this._screenshotController.StartTakePhotoScreenshot(true);
            this._screenshotUIController.ToggleEasyUploadWindow(true);
        });
        this._screenshotController.RecordVideo();

    }

    /* Timer */

    private StartTimer() {
        this._coRecordingTimer = this.StartCoroutine(this.CoStartTimer());
        this._screenshotUIController.TakePhotoScreenshotButton.interactable = false;
        this._screenshotUIController.ExitButton.interactable = false;
        this._canEnterOrExit = false;
        this.StartCoroutine(this.ImageColorPingpong(this._screenshotUIController.VideoTimer.GetComponent<Image>()));
    }

    private StopTimer() {
        this.StopCoroutine(this._coRecordingTimer);
        this._screenshotUIController.VideoTimer.SetActive(false);
        this._screenshotUIController.ExitButton.interactable = true;
        this._canEnterOrExit = true;
    }

    private *ImageColorPingpong(image: Image) {
        while (image.gameObject.activeSelf) {
            image.color = Color.Lerp(new Color(1.000, 0.271, 0.235, 1.000), new Color(0.851, 0.243, 0.208, 1.000), Mathf.PingPong(Time.time, 1));
            yield null;
        }
    }

    /* Coroutine */

    private *CoStartTimer() {
        let elapsedTime = 0;
        this._screenshotUIController.VideoTimer.SetActive(true);
        while (true) {
            elapsedTime += Time.deltaTime;
            let time = Math.floor(elapsedTime);
            let timetext = "";

            if (time < 60) {
                timetext = `00:${time >= 10 ? time : '0' + time}`;
            } else {
                timetext = `${time % 60 >= 10 ? time % 60 : '0' + time % 60}:${time / 60 >= 10 ? time / 60 : '0' + time / 60}`;
            }
            this._videoTimerText.text = timetext;
            yield null;
        }
    }

    private *CoShowToastWindow(result: bool) {
        if (result) {
            yield new WaitForSeconds(0.5);
            this._screenshotUIController.ToggleProgressToastWindow(false);
            this._screenshotUIController.ToggleSuccessToastWindow(true);
            this.StartCoroutine(this.CoHideToastWithTimer(this._screenshotUIController.SuccessToast, 2));
        }
        else {
            yield new WaitForSeconds(0.5);
            this._screenshotUIController.ToggleProgressToastWindow(false);
            this._screenshotUIController.ToggleFailToastWindow(true);
            this.StartCoroutine(this.CoHideToastWithTimer(this._screenshotUIController.FailToast, 2));
        }
    }

    private *CoHideToastWithTimer(toast: GameObject, timer: number) {
        let waitForSeconds = new WaitForSeconds(timer);
        yield waitForSeconds;

        if (GameObject.op_Equality(toast, null)) {
            return;
        }
        else {
            toast.SetActive(false);
        }
    }

}