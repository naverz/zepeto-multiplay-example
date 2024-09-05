import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField } from 'UnityEngine.UI';
import { GameObject } from 'UnityEngine';

export default class ScreenshotUIController extends ZepetoScriptBehaviour {

    @SerializeField() private _screenshotCanvas: GameObject;
    @SerializeField() private _simpleResultPanel: GameObject;

    @Header("Screenshot Main UI")
    @SerializeField() private _takePhotoButton: Button;
    @SerializeField() private _takeVideoButton: Button;
    @SerializeField() private _exitButton: Button;
    @SerializeField() private _videoTimer: GameObject;

    @Header("Preview Panel")
    @SerializeField() private _previewPanel: GameObject;
    @SerializeField() private _previewUploadButton: Button;
    @SerializeField() private _previewShareButton: Button;
    @SerializeField() private _previewSaveButton: Button;
    @SerializeField() private _previewExitButton: Button;
    @SerializeField() private _previewRawImage: GameObject;
    @SerializeField() private _previewVideoRawImage: GameObject;
    @SerializeField() private _previewInputField: InputField;

    @Header("Toasts")
    @SerializeField() private _successToast: GameObject;
    @SerializeField() private _failToast: GameObject;
    @SerializeField() private _progressToast: GameObject;

    private IsValid(value: any) {
        if (value == undefined || value == null) {
            return false;
        }
        return true;
    }

    public set SimpleResultPanel(value: any) { this._simpleResultPanel = value; }

    public get SimpleResultPanel() { return this._simpleResultPanel; }

    public set ProgressToast(value: any) { this._progressToast = value; }

    public get ProgressToast(): GameObject { return this._progressToast; }

    public set FailToast(value: any) { this._failToast = value; }

    public get FailToast(): GameObject { return this._failToast; }

    public set SuccessToast(value: any) { this._successToast = value; }

    public get SuccessToast(): GameObject { return this._successToast; }

    // returns {bool}
    public get IsUIActive(): bool {
        if (!this.IsValid(this._screenshotCanvas)) {
            console.error("Invalid screenshotCanvas");
        }
        return this._screenshotCanvas.activeSelf;
    }

    public get IsPreviewWindowActive() {
        if (!this.IsValid(this._previewPanel)) {
            console.error("Invalid Preview Panel");
        }
        return this._previewPanel.activeSelf;
    }

    // returns {GameObject}
    public get VideoTimer() {
        if (!this.IsValid(this._videoTimer)) {
            console.error("Invalid VideoTimer GameObject");
        }
        return this._videoTimer;
    }

    public get PreviewWindow() {
        if (!this.IsValid(this._previewPanel)) {
            console.error("Invalid Preview Panel");
        }
        return this._previewPanel;
    }

    public get PreviewRawImage() {
        if (!this.IsValid(this._previewRawImage)) {
            console.error("Invalid Preview Raw Image");
        }
        return this._previewRawImage;
    }

    public get PreviewVideoRawImage() {
        if (!this.IsValid(this._previewVideoRawImage)) {
            console.error("Invalid Preview Raw Image");
        }
        return this._previewVideoRawImage;
    }

    // returns {Button}
    public get TakePhotoScreenshotButton() {
        if (!this.IsValid(this._takePhotoButton)) {
            console.error("Invalid Photo Button");
        }
        return this._takePhotoButton;
    }

    public get TakeVideoScreenshotButton() {
        if (!this.IsValid(this._takeVideoButton)) {
            console.error("Invalid Video Button");
        }
        return this._takeVideoButton;
    }

    public get ExitButton() {
        if (!this.IsValid(this._exitButton)) {
            console.error("Invalid ExitButton Button");
        }
        return this._exitButton;
    }

    public get PreviewExitButton() {
        if (!this.IsValid(this._previewExitButton)) {
            console.error("Invalid Preview Exit Button");
        }
        return this._previewExitButton;
    }

    public get PreviewUploadButton() {
        if (!this.IsValid(this._previewUploadButton)) {
            console.error("Invalid Preview Upload Button");
        }
        return this._previewUploadButton;
    }

    public get PreviewShareButton() {
        if (!this.IsValid(this._previewShareButton)) {
            console.error("Invalid Preview Share Button");
        }
        return this._previewShareButton;
    }

    public get PreviewSaveButton() {
        if (!this.IsValid(this._previewSaveButton)) {
            console.error("Invalid Preview Save Button");
        }
        return this._previewSaveButton;
    }

    // returns {InputField}
    public get PreviewInputField() {
        if (!this.IsValid(this._previewInputField)) {
            console.error("Invalid Preview Input Field");
        }
        return this._previewInputField;
    }

    /* UI Toggle */
    public ToggleUI() {
        if (this.IsUIActive) {
            this._screenshotCanvas.SetActive(false);
        }
        else {
            this._screenshotCanvas.SetActive(true);
        }
    }

    public ToggleEasyUploadWindow(value:bool) {
        this._simpleResultPanel.SetActive(value);
    }

    public ToggleSuccessToastWindow(value: bool) {
        this._successToast.SetActive(value);
    }

    public ToggleFailToastWindow(value: bool) {
        this._failToast.SetActive(value);
    }

    public ToggleProgressToastWindow(value: bool) {
        this._progressToast.SetActive(value);
    }

    public TogglePreviewRawImage(value: bool) {
        this._previewRawImage.SetActive(value);
    }

    public TogglePreviewVideoRawImage(value: bool) {
        this._previewVideoRawImage.SetActive(value);
    }

}