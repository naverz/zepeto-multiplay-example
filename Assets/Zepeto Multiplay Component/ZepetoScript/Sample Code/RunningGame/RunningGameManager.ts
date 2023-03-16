import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {BoxCollider, Object, WaitUntil ,Vector3, Quaternion,Random} from "UnityEngine";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import { ZepetoPlayers ,ZepetoCharacter} from 'ZEPETO.Character.Controller';
import MultiplayManager from '../../Common/MultiplayManager';
import GameUICanvas from '../../Sample Code/RunningGame/GameUICanvas';
import StartFinishLine from '../../Sample Code/RunningGame/StartFinishLine';

export default class RunningGameManager extends ZepetoScriptBehaviour {
    public respawnPoint :Vector3;
    
    private _gameUICanvas: GameUICanvas;
    private _startFinishLine: StartFinishLine;
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _localCharacter :ZepetoCharacter;

    private Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._gameUICanvas = Object.FindObjectOfType<GameUICanvas>();
        this._startFinishLine = Object.FindObjectOfType<StartFinishLine>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;

            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            });
            
            this._room.AddMessageHandler("CountDownStart", (startServerTime:number) => {
                this.StartCoroutine(this.StartCoundDown(startServerTime));                
                this._localCharacter.Teleport(this.respawnPoint * Random.Range(0.9,1.1), Quaternion.identity);
            });
            this._room.AddMessageHandler("FirstPlayerGetIn", (endServerTime:number) => {
                this.StartCoroutine(this.EndCoundDown(endServerTime));
            });
            
            this._room.AddMessageHandler("ResponseGameReport", (gameReport:GameReport) => {
                this._gameUICanvas.SetNewReport(gameReport.playerUserId,gameReport.playerLapTime);
            });
        };
    }
    
    private Init(){
        this._gameUICanvas.DeleteReport();
    }
    
    private *StartCoundDown(startServerTime:number){
        const CountDelay = 3;
        for(let i=0; i<=CountDelay; i++) {
            yield new WaitUntil(() => MultiplayManager.instance.GetServerTime() - startServerTime > (i+1)*1000);
            this._gameUICanvas.SetCountUI(CountDelay-i);
        }       
        this._startFinishLine.StartGame();
    }
    
    private *EndCoundDown(endServerTime:number){
        const CountDelay = 10;
        for(let i=0; i<=CountDelay; i++) {
            yield new WaitUntil(() => MultiplayManager.instance.GetServerTime() - endServerTime > (i+1)*1000);
            this._gameUICanvas.SetCountUI(CountDelay-i);
        }
        this._startFinishLine.Init();
        this._gameUICanvas.Init();
        this.Init();
    }
    
}

export interface GameReport{
    playerUserId : string;
    playerLapTime : number;
}