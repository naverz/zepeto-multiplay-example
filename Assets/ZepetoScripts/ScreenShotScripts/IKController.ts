import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Transform, Animator, AvatarIKGoal } from 'UnityEngine'

export default class IKController extends ZepetoScriptBehaviour {

    // IK target of body and head
    private lookAtTarget: Transform;
    // rightHand's IK target
    private gripTarget: Transform;

    // Body and head weight setting for target
    // Controls how strongly the body reacts to the movement of the target
    private bodyWeight: number = 0.3;
    private headWeight: number = 0.7; 

    //Whether or not to apply IK
    private useIKWeight: boolean = false;
    private animator: Animator;

    Start() {
        this.animator = this.GetComponent<Animator>();
        //Disable IK weight initially, and use it when changing to selfie mode
        this.SetIKWeightActive(false);
    }

    //Toggle IK weight on/off
    public SetIKWeightActive(active: boolean) {
        this.useIKWeight = active;
    }

    // Set Target to look at and Grip to reach out
    public SetTargetAndGrip(lookAtTarget: Transform, gripTarget: Transform) {
        this.lookAtTarget = lookAtTarget;
        this.gripTarget = gripTarget;
    }

    OnAnimatorIK(layerIndex: number) {

        // IK is not using IK, Third-person mode
        if(!this.useIKWeight) {
            return;
        }

        // When using IK, Selfie mode
        if (this.animator == null ||
            this.lookAtTarget == null ||
            this.gripTarget == null)
            return;

        // Set the look weight when the body and head looks at the target. 
        this.animator.SetLookAtWeight(1, this.bodyWeight, this.headWeight);
        // set lookAt target
        this.animator.SetLookAtPosition(this.lookAtTarget.position);

        // Set target weight for rightHand
        this.animator.SetIKPositionWeight(AvatarIKGoal.RightHand, 1);
        // Set the rightHand to Grip where it extends
        this.animator.SetIKPosition(AvatarIKGoal.RightHand, this.gripTarget.position);
    }
}
