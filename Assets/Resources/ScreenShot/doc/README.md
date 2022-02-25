# ScreenShotSample

![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShotSample.png)


ZepetoWorldContent API의 이미지 관련 함수를 이용한 뉴월드 스크린샷 예제 프로젝트입니다. 프로젝트를 실행하려면 사전에 [ZEPETO 로그인](https://studio.zepeto.me/kr/guides/preparing-for-world-creating)을 진행해야 합니다.


<br/><br/>

## Overview
[이미지 저장/공유/피드 올리기](https://studio.zepeto.me/kr/guides/image-save-share-upload)를 기반으로 작성된 예제입니다. 셀피 모드와 ZepetoCamera 모드로 구성되어 있으며 이미지를 RenderTexture로 저장하거나 공유하고, 이미지를 활용하여 피드를 작성합니다.


<br/><br/>

## Guide

기존 프로젝트에 적용하는 경우 아래와 같은 가이드라인을 따르는 것을 권장합니다.

- **Zepeto.World 버전은 1.1.5 이상이어야 합니다.**
    
    world 1.1.5버전 이상으로 진행해야 정상적으로 ZepetoWorldContent 기능을 사용할 수 있습니다. Window - PackageManager - Zepeto.World 에서 버전 업데이트를 진행할 수 있습니다.
    

- **샘플 프로젝트 내 21번 Layer는 Player로 지정되어 있습니다.**
    
    기존 프로젝트에 적용 시 커스텀 레이어 21번을 사용하고 있다면 ZepetoScreenShotModule.ts에서 playerLayer의 값을 수정해주세요.
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShot_Setting1.png)<br/>
- **Scene에 ZepetoPlayers가 있어야 합니다.**<br/>

- **플레이어 생성 코드는 별도로 작성해주어야 합니다.**    
    프로젝트 내 PlayerCreator.ts 파일을 참고해주세요.<br/>


- **Scene에 ZepetoScreenShotModule 넣어주어야 합니다.**<br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShot_Setting2.png)<br/><br/>

- **IKPass가 활성화된 Animator가 사용되어야 합니다.**<br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShot_Setting3.png)<br/><br/>

    - 기존 ZepetoAnimator를 사용하는 경우
    
      ZepetoPlayers에서 ZepetoAnimator를 파일을 로컬 환경의 Assets/... 경로로 드래그하여 해당 에셋을 복사합니다. 복사한 ZepetoAnimator의 IKPass를 활성화한 뒤 ZepetoPlayers의 Animator Controller에 해당 animator로 교체해줍니다.
    
    - Custom Animator를 사용하는 경우
    
      기존에 사용하고 있는 Animator의 IKPass를 활성화해주세요.<br/><br/>
    
- **회전 방향은 Horizontal을 기준으로 지원합니다.**<br/>
ZepetoWorldSetting에서 Orientation - Horizontal로 설정해주세요.<br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShot_Setting4.png)<br/><br/>

- **카메라 설정 관련**<br/>
    
    ZepetoCamera 모드의 카메라 설정은 ZepetoPlayers - Camera의 설정을 변경합니다.<br/>
    
    ![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShot_Setting5.png)<br/><br/>

    셀피 카메라 모드의 카메라 설정은 Resources - SelfieCamera 프리팹에서 SelfieCamera.ts의 설정 값을 변경합니다.<br/>

    ![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/ScreenShot_Setting6.png)<br/><br/>

