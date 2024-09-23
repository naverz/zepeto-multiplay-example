import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { LocalPlayer, CharacterState, ZepetoCharacter, ZepetoPlayers, ZepetoScreenTouchpad } from 'ZEPETO.Character.Controller';
import { OfficialContentType, ZepetoWorldContent, Content } from 'ZEPETO.World';
import { Button, Toggle } from 'UnityEngine.UI';
import { Object, GameObject, Transform, AnimationClip, WaitForSeconds, Coroutine } from 'UnityEngine';
import Thumbnail from './Thumbnail';

export default class GestureLoader extends ZepetoScriptBehaviour {

    @HideInInspector() public contents: Content[] = [];
    @HideInInspector() public thumbnails: GameObject[] = [];
    @HideInInspector() public gestureCoroutine: Coroutine;

    @SerializeField() private _loadContentsCount: number = 100;
    @SerializeField() private _contentsParent: Transform;
    @SerializeField() private _prefThumb: GameObject;

    @SerializeField() private _closeButton: Button;
    @SerializeField() private _typeToggleGroup: Toggle[];

    private _myCharacter: ZepetoCharacter;
    private _poseIsRunning: bool;

    private _gestureLoader: GestureLoader;

    @Header("Playback Settings")
    @Header("Gesture")
    @Tooltip("Activate/Deactivate the looping feature") public loopEnabled: boolean;
    @Tooltip("Waiting time in seconds before playing") @SerializeField() private _loopInterval: number; // Waiting time in seconds before playing the gesture again.

    @Header("Pose")
    @Tooltip("Pose duration in seconds") @SerializeField() private _duration: number; //Pose duration in seconds 

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            // In order to take a thumbnail with my character, You need to request the content after the character is created.
            this._myCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            this.ContentRequest();

            // If click the close button, cancel the gesture
            this._closeButton.onClick.AddListener(() => {
                this._myCharacter.CancelGesture();
            });

            const touchPad = Object.FindObjectOfType<ZepetoScreenTouchpad>();
            this.InitScreenTouchPadListener(touchPad);
        });

        // UI Listener
        this._typeToggleGroup[0].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.All);
        });
        this._typeToggleGroup[1].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.Gesture);
        });
        this._typeToggleGroup[2].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.Pose);
        });
        this._typeToggleGroup[3].onValueChanged.AddListener(() => {
            this.SetCategoryUI(OfficialContentType.GestureDancing);
        });
    }

    // 1. Receive content from the server
    private ContentRequest() {
        // All Type Request
        ZepetoWorldContent.RequestOfficialContentList(OfficialContentType.All, contents => {
            this.contents = contents;
            for (let i = 0; i < this._loadContentsCount; i++) {
                if (!this.contents[i].IsDownloadedThumbnail) {
                    // Take a thumbnail photo using my character
                    this.contents[i].DownloadThumbnail(this._myCharacter, () => {
                        this.CreateThumbnailObjcet(this.contents[i]);
                    });
                } else {
                    this.CreateThumbnailObjcet(this.contents[i]);
                }
            }
        });
    }

    // 2. Creating Thumbnail Objects
    private CreateThumbnailObjcet(content: Content) {
        const newThumb: GameObject = GameObject.Instantiate(this._prefThumb, this._contentsParent) as GameObject;
        newThumb.GetComponent<Thumbnail>().content = content;

        // Button Listener for each thumbnail
        newThumb.GetComponent<Button>().onClick.AddListener(() => {
            this.LoadAnimation(content);
        });
        this.thumbnails.push(newThumb);
    }

    // 3. Loading Animation
    private LoadAnimation(content: Content) {
        // Verify animation load
        if (!content.IsDownloadedAnimation) {
            // If the animation has not been downloaded, download it.
            content.DownloadAnimation(() => {
                // play animation clip
                this.runAnimation(content.AnimationClip, content.Keywords)
            });
        } else {
            this.runAnimation(content.AnimationClip, content.Keywords)
        }
    }

    // A function to run an animation, 
    private runAnimation(animation: AnimationClip, gestureType: OfficialContentType[]) {
        //if there is another gesture/pose coroutine running, stop the coroutine and cancel the gesture/pose
        if (this.gestureCoroutine) {
            this.StopCoroutine(this.gestureCoroutine);
        }
        //Reset the animator speed to 1
        this._myCharacter.ZepetoAnimator.speed = 1;
        this._myCharacter.CancelGesture()


        // In case the gesture is not a pose.
        if (this._isNotAPose(gestureType)) {
            //checks if the looping feature is enable for the gestures that are not poses and start a coroutine.
            if (this.loopEnabled) {
                this.gestureCoroutine = this.StartCoroutine(this.setGestureLoop(animation))
            }
            // When the looping is not enabled
            else {
                this._myCharacter.SetGesture(animation)
            }
        }
        // In case the gesture is a pose
        else {
            //activate the pose
            this._poseIsRunning = true;
            this.gestureCoroutine = this.StartCoroutine(this.setPose(animation))
        }
    }
    //This function checks if the selected gesture is not a pose.
    private _isNotAPose(gestureType: OfficialContentType[]): bool {
        return gestureType.every(item => item !== OfficialContentType.Pose && item !== OfficialContentType.GesturePose)
    }

    // A coroutine for running the Gesture in loop
    public *setGestureLoop(animation: AnimationClip) {
        while (true) {
            if (this._myCharacter.CurrentState === CharacterState.Idle && animation) {
                this._myCharacter.SetGesture(animation)
                yield new WaitForSeconds(animation.length + this._loopInterval)
            }
            else {
                yield null;
            }
        }
    }
    // This function runs the Gesture Pose 
    public *setPose(animation: AnimationClip) {
        while (true) {
            //Checks if the pose is activated
            if (this._poseIsRunning) {
                // Run the animation
                this._myCharacter.SetGesture(animation)
                //Stop the animation and wait for a few seconds ( the number of seconds to wait is set by posingInterval)
                this._myCharacter.ZepetoAnimator.speed = 0;
                yield new WaitForSeconds(this._duration)
                this._poseIsRunning = false;
                this._myCharacter.ZepetoAnimator.speed = 1;
                this._myCharacter.CancelGesture()
            }
            else {
                yield null;
            }
        }
    }

    // Category Toggle UI Set
    private SetCategoryUI(category: OfficialContentType) {

        if (category == OfficialContentType.All) {
            this._gestureLoader.thumbnails.forEach((Obj) => {
                Obj.SetActive(true);
            });
        } else {
            for (let i = 0; i < this._gestureLoader.thumbnails.length; i++) {
                const content = this._gestureLoader.thumbnails[i].GetComponent<Thumbnail>().content;
                if (content.Keywords.includes(category)) {
                    this._gestureLoader.thumbnails[i].SetActive(true);
                } else {
                    this._gestureLoader.thumbnails[i].SetActive(false);
                }
            }
        }
    }

    //This function initialize the ZepetoScreenTouchPad event listener
    public InitScreenTouchPadListener(ScreenTouchpad: ZepetoScreenTouchpad) {

        ScreenTouchpad.OnPointerDownEvent.AddListener(() => {
            this._myCharacter.CancelGesture();
        })
    }

    private StopGesture() {

        //If there is a gesture coroutine stop it.
        if (this._gestureLoader.gestureCoroutine) {
            this._gestureLoader.StopCoroutine(this._gestureLoader.gestureCoroutine);
        }
        this._myCharacter.ZepetoAnimator.speed = 1;
        this._myCharacter.CancelGesture();
    }


}