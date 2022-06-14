import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Transform, Animator, AvatarIKGoal } from 'UnityEngine'

export default class IKController extends ZepetoScriptBehaviour {

    // IK target of body and head
    private lookAtTarget: Transform;
    // rightHand's IK target
    private gripTarget: Transform;

    // Body and head weight setting for target
    // - Make the head react more loudly to the movement of the target
    private bodyWeight: number = 0.3;
    private headWeight: number = 0.7; 

    // IK application status
    private useIKWeight: boolean = false;
    private animator: Animator;

    Start() {
        this.animator = this.GetComponent<Animator>();
        // Initially, do not use IK Weight but only use it when changing to selfie mode
        this.SetIKWeightActive(false);
    }

    // Set whether to apply IK Weight
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

        // Set the look at weight when the body and head look at the target
        this.animator.SetLookAtWeight(1, this.bodyWeight, this.headWeight);
        // set lookAt target
        this.animator.SetLookAtPosition(this.lookAtTarget.position);

        // Set target weight for rightHand
        this.animator.SetIKPositionWeight(AvatarIKGoal.RightHand, 1);
        // Set the rightHand to Grip where it extends
        this.animator.SetIKPosition(AvatarIKGoal.RightHand, this.gripTarget.position);
    }
}
