import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { LocalPlayer, SpawnInfo, ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { OfficialContentType, WorldService, ZepetoWorldContent, Content } from 'ZEPETO.World';
import { RawImage, Text, Button } from 'UnityEngine.UI';
import { GameObject, Texture2D, Transform, WaitUntil } from 'UnityEngine';
import Thumbnail from './Thumbnail';

export default class GestureLoader extends ZepetoScriptBehaviour {

    @HideInInspector() public contents: Content[] = [];
    @HideInInspector() public thumbnails: GameObject[] = [];

    @SerializeField() private _count: number = 50;
    @SerializeField() private _contentsParent: Transform;
    @SerializeField() private _prefThumb: GameObject;

    private _myCharacter: ZepetoCharacter;
    
    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._myCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;

            // In order to take a thumbnail with my character, You need to request the content after the character is created.
            this.ContentRequest();
        });
    }


    // 1. Receive content from the server
    private ContentRequest() {
        // All Type Request
        ZepetoWorldContent.RequestOfficialContentList(OfficialContentType.All, contents => {
            this.contents = contents;
            for (let i = 0; i < this._count; i++) {
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
    private LoadAnimation(content: Content) {
        // Verify animation load
        if (!content.IsDownloadedAnimation) {
            // If the animation has not been downloaded, download it.
            content.DownloadAnimation(() => {
                // play animation clip
                this._myCharacter.SetGesture(content.AnimationClip);
            });
        } else {
            this._myCharacter.SetGesture(content.AnimationClip);
        }
    }
}