import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {BoxCollider, Object, Transform, GameObject, WaitUntil} from "UnityEngine";
import {Button, Text} from "UnityEngine.UI";
import {Room} from "ZEPETO.Multiplay";
import {ZepetoWorldMultiplay, ZepetoWorldHelper,Users} from "ZEPETO.World";
import ReportItems from '../../Sample Code/RunningGame/ReportItems';
import ZepetoPlayersManager from '../../Player/ZepetoPlayersManager';
import {PositionInterpolationType, PositionExtrapolationType} from '../../Transform/TransformSyncHelper';

export default class GameUICanvas extends ZepetoScriptBehaviour {
    @SerializeField() private startButton: Button;
    @SerializeField() private timerText: Text;
    @SerializeField() private reportView: Transform;
    @SerializeField() private reportItemPref : GameObject;
    @SerializeField() private interpolationOptionText : Text;
    @SerializeField() private extrapolationOptionText : Text;

    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;

    private Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.Init();
        
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.startButton.onClick.AddListener(()=>{
                this._room.Send("StartRunningRequest");
                this.startButton.interactable = false;
            });

            this._room.AddMessageHandler("InitRunningGame", (enteredSessionId) => {
                this.Init();
            });
        }
    }
    
    public Init(){
        this.startButton.gameObject.SetActive(true);
        this.startButton.interactable = true;        
        this.timerText.gameObject.SetActive(true);
        this.reportView.GetComponentsInChildren<ReportItems>().forEach((ri)=>{
            Object.Destroy(ri.gameObject);
        });
        this.timerText.text = "Wait...";
        this.interpolationOptionText.text = PositionInterpolationType[ZepetoPlayersManager.instance.InterpolationType];
        this.extrapolationOptionText.text = PositionExtrapolationType[ZepetoPlayersManager.instance.ExtrapolationType];
    }

    public SetCountUI(num :number){
        this.startButton.gameObject.SetActive(false);
        if(num == 0) {
            this.timerText.gameObject.SetActive(false);
        }else{        
            this.timerText.gameObject.SetActive(true);
            this.timerText.text = num.toString();
        }
    }
    
    public SetNewReport(userId:string, lapTime:number){
        let usersID:string[] = [];
        usersID.push(userId);
        ZepetoWorldHelper.GetUserInfo(usersID, (info: Users[]) => {
            const newReport = Object.Instantiate(this.reportItemPref, this.reportView) as GameObject;
            newReport.GetComponent<ReportItems>().sessionIdText.text = info[0].name;
            newReport.GetComponent<ReportItems>().lapTimeText.text = lapTime.toString();
        },()=>{console.log("err")});
    }
    
    public DeleteReport(){
        this.reportView.GetComponentsInChildren<ReportItems>().forEach((ri)=>  Object.Destroy(ri.gameObject));
    }
}