import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { LocalPlayer, CharacterState, ZepetoCharacter, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import { OfficialContentType, ZepetoWorldContent, Content } from 'ZEPETO.World';
import { Button } from 'UnityEngine.UI';
import { Object, GameObject, Transform, AnimationClip, WaitForSeconds, Coroutine} from 'UnityEngine';
import Thumbnail from './Thumbnail';

export default class GestureLoader extends ZepetoScriptBehaviour {

    @HideInInspector() public contents: Content[] = [];
    @HideInInspector() public thumbnails: GameObject[] = [];
    @HideInInspector() public gestureCoroutine: Coroutine;
    @HideInInspector() public poseCoroutine: Coroutine;
    @HideInInspector() public animation: AnimationClip = null;

    @SerializeField() private _loadContentsCount: number = 100;
    @SerializeField() private _contentsParent: Transform;
    @SerializeField() private _prefThumb: GameObject;

    private _myCharacter: ZepetoCharacter;
    private _poseIsRunning: bool;
    
    // Loop setting
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
                    this.contents[i].DownloadThumbnail(this._myCharacter,() =>{
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
    private LoadAnimation(content: Content ) {
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
    private runAnimation(animation: AnimationClip, gestureType: OfficialContentType[] )
    {        
        //if there is another gesture/pose coroutine running, stop the coroutine and cancel the gesture/pose
        if(this.gestureCoroutine)
        {
            this.StopCoroutine(this.gestureCoroutine);
        }
        if(this.poseCoroutine)
        {
            this.StopCoroutine(this.poseCoroutine);
        }
        this._myCharacter.CancelGesture()
        
        //Reset the animator speed to 1
        this._myCharacter.ZepetoAnimator.speed = 1;

        // In case the gesture is not a pose.
        if(this._isNotAPose(gestureType))
        {
            //checks if the looping feature is enable for the gestures that are not poses and start a coroutine.
            if(this.loopEnabled)
            {
                this.gestureCoroutine = this.StartCoroutine(this.setGestureLoop(animation))
            }
            // When the looping is not enabled
            else
            {
                this._myCharacter.SetGesture(animation)
            }  
        }
        // In case the gesture is a pose
        else
        {
            //activate the pose
            this._poseIsRunning = true;
            this.poseCoroutine = this.StartCoroutine(this.setPose(animation))
        }         
    }
    //This function checks if the selected gesture is not a pose.
    private _isNotAPose(gestureType: OfficialContentType[]):bool
    {
        return gestureType.every( item => item !== OfficialContentType.Pose && item !== OfficialContentType.GesturePose )
    }

    // A coroutine for running the Gesture in loop
    public *setGestureLoop(animation: AnimationClip)
    {        
        while(true){
            if(this._myCharacter.CurrentState === CharacterState.Idle && animation)
            {
                this._myCharacter.SetGesture(animation)
                yield new WaitForSeconds(animation.length + this._loopInterval)
            }
            else{
                yield null;
            }
        }
    }
    // This function runs the Gesture Pose 
    public *setPose(animation: AnimationClip)
    {
        while(true)
        {
            //Checks if the pose is activated
            if(this._poseIsRunning)
            {
                // Run the animation
                this._myCharacter.SetGesture(animation)
                //Stop the animation and wait for a few seconds ( the number of seconds to wait is set by posingInterval)
                this._myCharacter.ZepetoAnimator.speed = 0;
                yield new WaitForSeconds(this._duration)
                this._myCharacter.CancelGesture()
                this._poseIsRunning = false;
            }
            else
            {
                yield null;
            }
        }
    }
}