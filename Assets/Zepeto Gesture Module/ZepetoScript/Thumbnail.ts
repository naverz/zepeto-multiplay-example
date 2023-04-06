import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Content } from 'ZEPETO.World';
import { RawImage, Text } from 'UnityEngine.UI';
import { Texture2D } from 'UnityEngine';

export default class Thumbnail extends ZepetoScriptBehaviour {

    @HideInInspector() public content: Content;
    
    Start() {
        this.GetComponentInChildren<Text>().text = this.content.Title;
        this.GetComponentInChildren<RawImage>().texture = this.content.Thumbnail as Texture2D;
    }

}