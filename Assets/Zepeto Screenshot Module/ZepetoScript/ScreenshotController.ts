import { Application, AudioListener, Camera, Coroutine, GameObject, RenderTexture, WaitForEndOfFrame } from 'UnityEngine'
import { UnityEvent } from 'UnityEngine.Events';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { VideoPlayer } from 'UnityEngine.Video';
import { VideoResolutions, WorldVideoRecorder, ZepetoWorldContent } from 'ZEPETO.World';

export default class ScreenshotController extends ZepetoScriptBehaviour {

    @SerializeField() private _screenshotRenderTexture: RenderTexture;
    @SerializeField() private _videoMaxDuration: number = 60;
    @SerializeField() private _videoResolutionType: VideoResolutions = VideoResolutions.W720xH1280;

    private _mainCamera: Camera;
    private _replicaCamera: Camera;

    private _onScreenshotDone: UnityEvent;
    private _onFailEvent: UnityEvent;
    private _onSuccessEvent: UnityEvent;
    private _onProgressEvent: UnityEvent;

    private _onVideoRecordingStartEvent: UnityEvent;
    private _onVideoRecordingStopEvent: UnityEvent;

    private _coRecordVideo: Coroutine;

    LateUpdate() {
        if (!this.IsValid(this._replicaCamera)) {
            return;
        }
        this._replicaCamera.transform.position = this._mainCamera.transform.position;
        this._replicaCamera.transform.rotation = this._mainCamera.transform.rotation;
    }

    private IsValid(value: any) {
        if (value == undefined || value == null) {
            return false;
        }
        return true;
    }

    public SetScreenshotCamera(camera: Camera) {
        this._mainCamera = camera;
    }

    public get OnScreenshotDone() {
        if (!this.IsValid(this._onScreenshotDone)) {
            this._onScreenshotDone = new UnityEvent();
        }
        return this._onScreenshotDone;
    }

    public get OnFailEvent() {
        if (!this.IsValid(this._onFailEvent)) {
            this._onFailEvent = new UnityEvent();
        }
        return this._onFailEvent;
    }

    public get OnSuccessEvent() {
        if (!this.IsValid(this._onSuccessEvent)) {
            this._onSuccessEvent = new UnityEvent();
        }
        return this._onSuccessEvent;
    }

    public get OnProgressEvent() {
        if (!this.IsValid(this._onProgressEvent)) {
            this._onProgressEvent = new UnityEvent();
        }
        return this._onProgressEvent;
    }

    public get OnVideoRecordingStartEvent() {
        if (!this.IsValid(this._onVideoRecordingStartEvent)) {
            this._onVideoRecordingStartEvent = new UnityEvent();
        }
        return this._onVideoRecordingStartEvent;
    }

    public get OnVideoRecordingStopEvent() {
        if (!this.IsValid(this._onVideoRecordingStopEvent)) {
            this._onVideoRecordingStopEvent = new UnityEvent();
        }
        return this._onVideoRecordingStopEvent;
    }

    // returns {RenderTexture}
    public get ScreenshotRenderTexture() {
        if (!this.IsValid(this._screenshotRenderTexture)) {
            console.error("Invalid screenshot RenderTexture for recording");
            return null;
        }
        return this._screenshotRenderTexture;
    }

    /* PhotoFunction */
    public StartTakePhotoScreenshot(isVideo?: boolean) {
        // Use as a screenshot camera after replicating the main camera.
        let screenshotCamera = (GameObject.Instantiate(this._mainCamera) as GameObject).GetComponent<Camera>();
        GameObject.Destroy(screenshotCamera.GetComponent<AudioListener>());
        screenshotCamera.gameObject.name = "ScreenshotCamera";
        screenshotCamera.targetTexture = this._screenshotRenderTexture;
        this.StartCoroutine(this.CoTakePhotoScreenshot(screenshotCamera, isVideo));
    }

    private *CoTakePhotoScreenshot(camera: Camera, isVideo?: boolean) {
        let waitForEndOfFrame = new WaitForEndOfFrame();
        yield waitForEndOfFrame;
        camera.transform.position = this._mainCamera.transform.position;
        camera.transform.rotation = this._mainCamera.transform.rotation;
        camera.Render();
        camera.targetTexture = null;
        yield waitForEndOfFrame;

        if (!this.IsValid(isVideo)) {
            if (this.IsValid(this._onScreenshotDone)) {
                this._onScreenshotDone.Invoke();
            }
        }

        GameObject.Destroy(camera.gameObject);
    }

    public PhotoPostToFeed(feedMessage: string) {
        if (Application.isEditor) {
            this._onFailEvent.Invoke();
        }

        if (this.IsValid(this._onProgressEvent)) { 
            this._onProgressEvent.Invoke();
        }

        ZepetoWorldContent.CreateFeed(this._screenshotRenderTexture, feedMessage, (result: boolean) => {
            if (result && this.IsValid(this._onSuccessEvent)) {
                this._onSuccessEvent.Invoke();
            }

            if (!result && this.IsValid(this._onFailEvent)) {
                this._onFailEvent.Invoke();
            }
        });
    }

    public PhotoSave() {
        if (Application.isEditor) {
            this._onFailEvent.Invoke();
        }

        if (this.IsValid(this._onProgressEvent)) {
            this._onProgressEvent.Invoke();
        }

        ZepetoWorldContent.SaveToCameraRoll(this._screenshotRenderTexture, (result: boolean) => {
            if (result) {
                if (result && this.IsValid(this._onSuccessEvent)) {
                    this._onSuccessEvent.Invoke();
                }

                if (!result && this.IsValid(this._onFailEvent)) {
                    this._onFailEvent.Invoke();
                }
            }
        });
    }

    public PhotoShare() {
        ZepetoWorldContent.Share(this._screenshotRenderTexture, (result: boolean) => {
            if (!result && this.IsValid(this._onFailEvent)) {
                this._onFailEvent.Invoke();
            }
        });
    }

    /* VideoFunction */
    public ResetVideoRecordingEvent() {
        if (!this.IsValid(this._onVideoRecordingStartEvent)) {
            this._onVideoRecordingStartEvent = new UnityEvent();
        }
        else {
            this._onVideoRecordingStartEvent.RemoveAllListeners();
        }

        if (!this.IsValid(this._onVideoRecordingStopEvent)) {
            this._onVideoRecordingStopEvent = new UnityEvent();
        }
        else {
            this._onVideoRecordingStopEvent.RemoveAllListeners();
        }
    }

    public RecordVideo() {
        if (WorldVideoRecorder.IsRecording()) {
            this.StopCoroutine(this._coRecordVideo);
            this.RecordingDone();
        } else {
            this._coRecordVideo = this.StartCoroutine(this.CoRecordVideo());
        }
    }

    private *CoRecordVideo() {
        this._replicaCamera = (GameObject.Instantiate(this._mainCamera) as GameObject).GetComponent<Camera>();
        GameObject.Destroy(this._replicaCamera.GetComponent<AudioListener>());
        this._replicaCamera.gameObject.name = "ScreenshotCamera";

        let startRecording = WorldVideoRecorder.StartRecording(this._replicaCamera, this._videoResolutionType, this._videoMaxDuration);

        // startRecording
        if (!startRecording) {
            if (this.IsValid(this._onFailEvent)) {
                this._onFailEvent.Invoke();
            }
        } else {
            if (this.IsValid(this._onVideoRecordingStartEvent)) {
                this._onVideoRecordingStartEvent.Invoke();
            }
        }

        // IsRecording
        if (startRecording && !WorldVideoRecorder.IsRecording()) {
            if (this.IsValid(this._onFailEvent)) {
                this._onFailEvent.Invoke();
            }
            return;
        }

        while (WorldVideoRecorder.IsRecording()) {
            yield null;
        }

        // RecordingDone
        this.RecordingDone();
    }

    private RecordingDone() {
        if (this.IsValid(this._onVideoRecordingStopEvent)) {
            this._onVideoRecordingStopEvent.Invoke();
        }
        WorldVideoRecorder.StopRecording();
        GameObject.Destroy(this._replicaCamera.gameObject);
        this._replicaCamera = null;
    }

    public VideoPostToFeed(feedMessage: string) {
        if (Application.isEditor) {
            this._onFailEvent.Invoke();
        }

        if (this.IsValid(this._onProgressEvent)) {
            this._onProgressEvent.Invoke();
        }

        WorldVideoRecorder.CreateFeed(feedMessage, (result) => {
            if (result && this.IsValid(this._onSuccessEvent)) {
                this._onSuccessEvent.Invoke();
            }

            if (!result && this.IsValid(this._onFailEvent)) {
                this._onFailEvent.Invoke();
            }

        });
    }

    public VideoSave() {
        if (Application.isEditor) {
            this._onFailEvent.Invoke();
        }

        if (this.IsValid(this._onProgressEvent)) {
            this._onProgressEvent.Invoke();
        }

        WorldVideoRecorder.SaveToCameraRoll((result) => {
            if (result) {
                if (result && this.IsValid(this._onSuccessEvent)) {
                    this._onSuccessEvent.Invoke();
                }

                if (!result && this.IsValid(this._onFailEvent)) {
                    this._onFailEvent.Invoke();
                }
            }
        });
    }

    public VideoShare() {
        WorldVideoRecorder.Share((result) => {
            if (result) {
                if (!result && this.IsValid(this._onFailEvent)) {
                    this._onFailEvent.Invoke();
                }
            }
        });
    }

    public DestroyVideoPlayerComponent(playerObject: GameObject) {
        let existingVideoPlayer = playerObject.GetComponent<VideoPlayer>();
        if (existingVideoPlayer != null) {
            existingVideoPlayer.Stop();
            GameObject.Destroy(existingVideoPlayer);
        }
    }

    public PlayPreviewVideo(playerObject: GameObject, width: number, height: number) {
       let videoPlayer = WorldVideoRecorder.AddVideoPlayerComponent(playerObject, width, height);
        if (videoPlayer == null) {
           return;
       }
        videoPlayer.isLooping = true;
        videoPlayer.Play();
    }

}