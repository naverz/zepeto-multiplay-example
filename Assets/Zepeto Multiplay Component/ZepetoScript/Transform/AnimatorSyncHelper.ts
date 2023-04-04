import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Animator, AnimatorStateInfo, GameObject, Object, Vector3, WaitUntil, WaitForEndOfFrame,Coroutine} from "UnityEngine";
import {Room, RoomData} from "ZEPETO.Multiplay";
import MultiplayManager from '../Common/MultiplayManager';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import SyncIndexManager from '../Common/SyncIndexManager';
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class AnimatorSyncHelper extends ZepetoScriptBehaviour {
    //This synchronizes the animator when its state changes. 
    // By default, the master synchronizes. 
    // When synchronizing transforms such as position, rotation, etc., it must be used with TransformSyncHelper.ts
    
    /** animator **/
    private _animator :Animator;
    private _stateInfo : AnimatorStateInfo;
    private _previousShortNameHash : number;

    /** multiplay **/
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _Id: string;
    private _isMasterClient: boolean;
    
    get Id() {
        return this._Id;
    }

    private Start() {
        this._animator = this.GetComponentInChildren<Animator>();
        
        this._Id = this.GetComponent<TransformSyncHelper>()?.Id ?? (SyncIndexManager.SyncIndex++).toString();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.SyncMessageHandler();
        };
    }
    
    private Update(){
        if(!this._isMasterClient)
            return;

        if(this._previousShortNameHash != this._animator.GetCurrentAnimatorStateInfo(0)?.shortNameHash){
            this.SendAnimator();
            this._previousShortNameHash = this._stateInfo.shortNameHash;
        }
    }

    public ChangeOwner(ownerSessionId:string){
        if(null == this._room)
            this._room = MultiplayManager.instance.room;
        if(this._room.SessionId == ownerSessionId){
            this._isMasterClient = true;
            this.SendAnimator();
        }
        else if(this._room.SessionId != ownerSessionId && this._isMasterClient) {
            this._isMasterClient = false;
        }
    }

    private SendAnimator() {
        console.log("send");

        this._stateInfo = this._animator?.GetCurrentAnimatorStateInfo(0);
        const clipNameHash = this._stateInfo.shortNameHash;
        const clipNormalizedTime = this._stateInfo.normalizedTime;
        
        const data = new RoomData();
        data.Add("Id", this._Id);
        data.Add("clipNameHash", clipNameHash);
        data.Add("clipNormalizedTime", clipNormalizedTime);

        this._room?.Send("SyncAnimator", data.GetObject());
    }

    private SyncMessageHandler() {
        const ResponseId: string = "ResponseAnimator" + this._Id;
        this._room.AddMessageHandler(ResponseId, (message: syncAnimator) => {
            this.GetSyncAnimator(message);
        });
    }

    private GetSyncAnimator(message:syncAnimator){
        this._animator.Play(message.clipNameHash, 0, message.clipNormalizedTime);
    }
}

interface syncAnimator {
    Id: string,
    clipNameHash: number,
    clipNormalizedTime: number
}