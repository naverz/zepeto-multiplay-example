import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {WaitUntil, HumanBodyBones, Vector3, Quaternion, Object, WaitForEndOfFrame} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import TransformSyncHelper from '../Transform/TransformSyncHelper';
import MultiplayManager from '../Common/MultiplayManager';

export default class PackingObject extends ZepetoScriptBehaviour {
    // This is a script that makes the Zepeto player move together by setting the object as a child object.
    // For example, holding a gun, holding a balloon,
    @SerializeField() private targetBone: HumanBodyBones;
    @SerializeField() private localPosition: Vector3 = Vector3.zero;
    @SerializeField() private localRotation: Vector3 = Vector3.zero;
    private _tfHelper:TransformSyncHelper;    

    private Start() {    
        this._tfHelper = this.transform.GetComponent<TransformSyncHelper>();
        if(this._tfHelper.OwnerSessionId)
            this.StartCoroutine(this.MountingObject(this._tfHelper.OwnerSessionId));
    }

    private *MountingObject(ownerSessiondId :string){
        yield new WaitForEndOfFrame();
        
        const user = MultiplayManager.instance?.room?.State?.players?.get_Item(ownerSessiondId) ?? null;
        if(user !== null) {
            yield new WaitUntil(() => ZepetoPlayers.instance.HasPlayer(ownerSessiondId));
            const player = ZepetoPlayers.instance.GetPlayer(ownerSessiondId).character;
            this.transform.parent = player.ZepetoAnimator.GetBoneTransform(this.targetBone);
            this.transform.localPosition = this.localPosition;
            this.transform.localRotation = Quaternion.Euler(this.localRotation);
        }
        
        //If the user is not in the room, Destroy it.
        else
            Object.Destroy(this.gameObject);
    }
}