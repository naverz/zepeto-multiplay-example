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
    private gameUICanvas: GameUICanvas;
    private startFinishLine: StartFinishLine;
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    
    private m_localCharacter :ZepetoCharacter;

    private Start() {
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.gameUICanvas = Object.FindObjectOfType<GameUICanvas>();
        this.startFinishLine = Object.FindObjectOfType<StartFinishLine>();

        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;

            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                this.m_localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            });
            
            this.room.AddMessageHandler("CountDownStart", (startServerTime:number) => {
                this.StartCoroutine(this.StartCoundDown(startServerTime));                
                this.m_localCharacter.Teleport(this.respawnPoint * Random.Range(0.9,1.1), Quaternion.identity);
            });
            this.room.AddMessageHandler("FirstPlayerGetIn", (endServerTime:number) => {
                this.StartCoroutine(this.EndCoundDown(endServerTime));
            });
            
            this.room.AddMessageHandler("ResponseGameReport", (gameReport:GameReport) => {
                this.gameUICanvas.SetNewReport(gameReport.playerUserId,gameReport.playerLapTime);
            });
        };
    }
    
    private Init(){
        this.gameUICanvas.DeleteReport();
    }
    
    private *StartCoundDown(startServerTime:number){
        const CountDelay = 3;
        for(let i=0; i<=CountDelay; i++) {
            yield new WaitUntil(() => MultiplayManager.instance.GetServerTime() - startServerTime > (i+1)*1000);
            this.gameUICanvas.SetCountUI(CountDelay-i);
        }       
        this.startFinishLine.StartGame();
    }
    
    private *EndCoundDown(endServerTime:number){
        const CountDelay = 10;
        for(let i=0; i<=CountDelay; i++) {
            yield new WaitUntil(() => MultiplayManager.instance.GetServerTime() - endServerTime > (i+1)*1000);
            this.gameUICanvas.SetCountUI(CountDelay-i);
        }
        this.startFinishLine.Init();
        this.gameUICanvas.Init();
        this.Init();
    }
    
}

export interface GameReport{
    playerUserId : string;
    playerLapTime : number;
}