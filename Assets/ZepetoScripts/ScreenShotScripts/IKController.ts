import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Transform, Animator, AvatarIKGoal } from 'UnityEngine'

export default class IKController extends ZepetoScriptBehaviour {

    // body와 head의 IK target
    private lookAtTarget: Transform;
    // rightHand의 IK target
    private gripTarget: Transform;

    // target에 대한 body와 head의 weight 설정
    // - head가 target의 움직임에 더 크게 반응하도록 함 
    private bodyWeight: number = 0.3;
    private headWeight: number = 0.7; 

    // IK 적용 여부
    private useIKWeight: boolean = false;
    private animator: Animator;

    Start() {
        this.animator = this.GetComponent<Animator>();
        // 처음에는 IK Weight를 사용하지 않고 셀카모드로 변경시에만 사용하도록 함
        this.SetIKWeightActive(false);
    }

    // IK Weight 적용 여부를 설정
    public SetIKWeightActive(active: boolean) {
        this.useIKWeight = active;
    }

    // 바라볼 Target과 손을 뻗을 위치 Grip 설정
    public SetTargetAndGrip(lookAtTarget: Transform, gripTarget: Transform) {
        this.lookAtTarget = lookAtTarget;
        this.gripTarget = gripTarget;
    }

    OnAnimatorIK(layerIndex: number) {

        // IK를 사용하지 않는 경우 - 3인칭 모드
        if(!this.useIKWeight) {
            return;
        }

        // IK를 사용하는 경우 - 셀피모드
        if (this.animator == null ||
            this.lookAtTarget == null ||
            this.gripTarget == null)
            return;

        // body와 head가 target을 바라보는 lookAt weight를 설정
        this.animator.SetLookAtWeight(1, this.bodyWeight, this.headWeight);
        // lookAt target 설정
        this.animator.SetLookAtPosition(this.lookAtTarget.position);

        // rightHand의 target weight 설정
        this.animator.SetIKPositionWeight(AvatarIKGoal.RightHand, 1);
        // rightHand가 뻗을 위치를 Grip으로 설정
        this.animator.SetIKPosition(AvatarIKGoal.RightHand, this.gripTarget.position);
    }
}