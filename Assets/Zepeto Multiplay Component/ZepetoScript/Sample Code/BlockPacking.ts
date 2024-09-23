import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {Collider, Transform, Vector3, Quaternion, Rigidbody, Object, WaitUntil} from "UnityEngine";
import {Room, RoomData} from "ZEPETO.Multiplay";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {ZepetoCharacter, ZepetoPlayer, ZepetoPlayers} from 'ZEPETO.Character.Controller';
import DOTWeenSyncHelper from '../DOTween/DOTWeenSyncHelper';
import TransformSyncHelper from '../Transform/TransformSyncHelper';

export default class BlockPacking extends ZepetoScriptBehaviour {
    //A script in which the Zepeto character is moved the same as the block on a DOTween moving block.
    
    private _dtHelper: DOTWeenSyncHelper;
    private _tfHelper: TransformSyncHelper;
    
    private _objectId : string;
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _isLocalCharacterOnBlock :boolean = false;
    
    private Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.GetObjectId();

            //When a new player comes in, send the player information about the currently up blocks.
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                if(this._isLocalCharacterOnBlock) {
                    const data = new RoomData();
                    data.Add("transformId", this._objectId);
                    data.Add("newJoinSessionId", sessionId);

                    this._room.Send("SendBlockEnterCache", data.GetObject());
                }
            });
            
            this._room.AddMessageHandler("BlockEnter" + this._objectId, (enteredSessionId) => {
                this.StartCoroutine(this.PlayerPacking(enteredSessionId.toString()));
            });
            this._room.AddMessageHandler("BlockExit" + this._objectId, (exitedSessionId) => {              
                this.StartCoroutine(this.PlayerUnPacking(exitedSessionId.toString()));
            });
        };
    }
    
    private OnTriggerEnter(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }

        if(this._isLocalCharacterOnBlock)
            return;
        
        this._isLocalCharacterOnBlock = true;
        this._room.Send("BlockEnter", this._objectId);
    }
    
    private OnTriggerExit(coll: Collider) {
        if(coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()){
            return;
        }
        
        this._isLocalCharacterOnBlock = false;
        this._room.Send("BlockExit", this._objectId);
    }

    private *PlayerPacking(enteredSessionId:string){
        //Wait until the player is fully loaded.
        yield new WaitUntil(()=>ZepetoPlayers.instance.HasPlayer(enteredSessionId));
        const player = ZepetoPlayers.instance.GetPlayer(enteredSessionId).character;
        player.transform.parent = this.transform;
    }

    private *PlayerUnPacking(exitedSessionId:string){
        yield new WaitUntil(()=>ZepetoPlayers.instance.HasPlayer(exitedSessionId));
        const player = ZepetoPlayers.instance.GetPlayer(exitedSessionId).character
        player.transform.parent = null;
    }
    
    private GetObjectId(){
        this._dtHelper = this.GetComponent<DOTWeenSyncHelper>();
        this._objectId = this._dtHelper?.Id;
        if(!this._objectId) {
            this._tfHelper = this.GetComponent<TransformSyncHelper>();
            this._objectId = this._tfHelper?.Id;
        }

        if(!this._objectId)
            console.warn(`${this.transform.name} The object must have a DOTweensyncHelper.ts or TransformSyncHelper.ts script.`);
    }
}