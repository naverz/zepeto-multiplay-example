import { AnimationClip, Animator, HumanBodyBones, Physics, Transform, Vector3, WaitForEndOfFrame} from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import InteractionIcon from './InteractionIcon'
import {ZepetoPlayers, ZepetoCharacter} from "ZEPETO.Character.Controller";

export default class GestureInteraction extends ZepetoScriptBehaviour {
    @SerializeField() private animationClip :AnimationClip;
    @SerializeField() private isSnapBone :boolean = true;
    @SerializeField() private bodyBone: HumanBodyBones = HumanBodyBones.Hips;
    @SerializeField() private allowOverlap : boolean = false;
    
    private _interactionIcon :InteractionIcon;
    private _isFirst : boolean = true;
    private _localCharacter : ZepetoCharacter;
    private _outPosition : Vector3;
    private _playerGesturePosition : Vector3;
    
    private Start() {
        this._interactionIcon = this.transform.GetComponent<InteractionIcon>();
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(()=>{
           this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
        
        this._interactionIcon.OnClickEvent.AddListener(()=> {
            // when onclick interaction icon
            this._interactionIcon.HideIcon();
            this.DoInteraction();
        });
    }

    private DoInteraction(){
        this._outPosition = this.transform.position;

        if(this.isSnapBone) {        
            //is place empty
            if(this.allowOverlap || this.FindOtherPlayerNum() < 1) {
                this._localCharacter.SetGesture(this.animationClip);                
                this.StartCoroutine(this.SnapBone());
                this.StartCoroutine(this.WaitForExit());
            }
            else{
                // The seats are full.
                this._interactionIcon.ShowIcon();
            }
        }
        else{
            this._localCharacter.SetGesture(this.animationClip);
            this.StartCoroutine(this.WaitForExit());
        }
    }
    
    private * SnapBone(){
        const animator: Animator = this._localCharacter.ZepetoAnimator;
        const bone: Transform = animator.GetBoneTransform(this.bodyBone);
        
        let idx =0;
        while(true) {
            const distance = Vector3.op_Subtraction(bone.position, this._localCharacter.transform.position);
            const newPos: Vector3 = Vector3.op_Subtraction(this.transform.position, distance);
            
            this._playerGesturePosition = newPos;
            this._localCharacter.transform.position = this._playerGesturePosition;
            this._localCharacter.transform.rotation = this.transform.rotation;
            yield new WaitForEndOfFrame();
            idx ++;
            // Calibrate position during 5 frames of animation.
            if(idx>5)
                return;
        }
    }
    
    // The exact method must go through the server code, but it is calculated by the local client for server optimization.
    private FindOtherPlayerNum(){
        const hitInfos = Physics.OverlapSphere(this.transform.position, 0.1);
        
        let playerNum = 0;
        if (hitInfos.length > 0){
            hitInfos.forEach((hitInfo)=>{
                if(hitInfo.transform.GetComponent<ZepetoCharacter>()){
                    playerNum ++;
                }
            });
        }
        return playerNum;
    }

    private *WaitForExit()
    {
        if (this._localCharacter) {
            while (true) {
                if (this._localCharacter.tryJump || this._localCharacter.tryMove)
                {        
                    this._localCharacter.CancelGesture();

                    this.transform.position = this._outPosition;
                    this._interactionIcon.ShowIcon();
                    break;
                }
                else if(this.isSnapBone && this._playerGesturePosition != this._localCharacter.transform.position){
                    this._interactionIcon.ShowIcon();
                    break;
                }
                yield;
            }
        }
    }
}