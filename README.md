# zepeto-multiplay-example

![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/preview.gif)


개발 서버를 이용한 멀티플레이 데모 프로젝트입니다. 프로젝트를 실행하려면 사전에 [ZEPETO 로그인](https://studio.zepeto.me/kr/guides/preparing-for-world-creating)을 진행해야 합니다.


<br/><br/>

## Overview
[ZEPETO Multiplay](https://studio.zepeto.me/kr/guides/multiplay)와  [Character Controller](https://studio.zepeto.me/kr/guides/character-control) 기반으로 작성된 예제입니다. 현재 접속중인 Room의 상태 (각 플레이어의 캐릭터 정보와 위치등)는 ZEPETO Multiplay 패키지내에 [Schema file](https://studio.zepeto.me/kr/guides/multiplay-room-state)에 정의되어 있으며 이를 각 클라이언트에 onStateChange 이벤트 콜백으로 전달하는 구조입니다. 

- 다른 개발 pc에서 접속할 경우, IP 주소로 서버 환경 설정 항목을 참고하세요.
[Multiplay IP 주소로 접속하기](https://studio.zepeto.me/kr/guides/accessing-to-multiplay-ip-addresses)

- 모바일기기로 접속할 경우, QR코드 생성 항목을 참고하세요. 
 [템플릿으로 시작하기](https://studio.zepeto.me/kr/guides/getting-started-with-templates)

<br/><br/>

## Scenes

- Sample Scene <br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Sample.png)<br/>
https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/SampleScene.unity<br/><br/><br/><br/>

- Theme Scene <br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Desert.JPG)<br/>
1. 사막 테마 Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/001_Desert.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Sakura.JPG)<br/>
2. 벚꽃 테마 Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/002_Sakura.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/ClassRoom.JPG)<br/>
3. 교실 테마 Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/003_ClassRoom.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Camping.JPG)<br/>
4. 캠핑 테마 Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/004_Camping.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Fall.JPG)<br/>
5. 가을 테마 Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/005_Fall.unity<br/><br/><br/><br/>


<br/><br/>

## 멀티플레이 가이드 영상
[ 1편 : 멀티플레이 설정하기 ]
- 멀티플레이 서버 생성부터 클라이언트 생성까지, 멀티플레이 월드 개발을 위한 환경 설정을 진행합니다.
- 월드 세팅, 서버 실행 등 멀티플레이 월드 개발 시 꼭 해야 할 설정들을 살펴봅니다.
- 🎥 영상 보기 : https://youtu.be/S68B1TMa-A8


[ 2편 : 월드 로직 작성하기 1 ]
- 서버, 클라이언트 간 통신을 위해 필요한 Schema에 대해 알아보고, Schema Types와 Room State를 정의합니다.
- Room Lifecycle을 통해 서버에서 기본적인 이벤트 처리 코드를 작성합니다.
- 또한 서버에 데이터를 저장하는 방법을 알아봅니다.
- 클라이언트에서 Room 생성 및 입장 시의 이벤트 처리 코드를 작성합니다.
- 또한 Room State를 통해 서버의 변경사항을 처리하는 코드를 작성합니다.
- Room message를 통해 클라이언트에서 서버로 State를 전송하는 방법을 알아봅니다.
- 서버에서 message를 수신받아 State를 관리하는 방법을 알아봅니다.
- 🎥 영상 보기 : https://youtu.be/k-Vi8XVXGCY

[ 3편 : 월드 로직 작성하기 2 ] 
- 플레이어의 위치 동기화부터 플레이어의 퇴장까지를 진행합니다.
- 클라이언트의 현재 위치를 일정 시간 마다 서버로 전송합니다.
- 그리고 서버에서 수신 받은 다른 플레이어의 위치를 동기화합니다.
- 마지막으로 플레이어의 퇴장에 대한 처리도 진행해 월드 로직을 마무리합니다.
- 🎥 영상 보기 : https://youtu.be/_PL7gEKgm_Q

[ 4편 : 서버 구동 및 멀티플레이 접속하기 ] 
- 이번 편에서는 서버를 구동하고 접속하여 멀티플레이를 진행합니다.
- 먼저 서버를 구동하고 접속하는 방법을 알아봅니다.
- 그리고 QR코드 접속과 IP주소로 접속 할 수 있는 custom environment 방식으로
- 멀티플레이 환경에 접속해봅니다.
-  🎥 영상 보기 : https://youtu.be/FmK6JNlSjJA

[ 5편 : 멀티플레이 심화:IWP 서버 연동과 서버 DataStorage ]
- 멀티플레이에서 사용 가능한 IWP와 DataStorage를 활용해봅니다.
- 월드 상품을 구매할 수 있는 IWP 기능을 통해 월드에 물약을 만들고
- 구매 시 플레이어 이동 속도가 증가하도록 구현해 봅니다.
- 그리고 플레이어의 데이터를 서버에 저장해주는 DataStorage를 통해
- 플레이어의 이동 속도를 저장하고 이후 입장 시에 데이터를 불러오는 과정을 진행해봅니다.
-  🎥 영상 보기 : https://youtu.be/d-MaqjP-vjA



<br/><br/>

## Room State 정의하기
State는 접속 중인 Room의 플레이어 정보, 플레이어 또는 오브젝트의 위치 등을 관리하기 위한 data structure 입니다. 
Multiplay 패키지내에 [schema 파일](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/World.multiplay/schemas.json)에 정의되어 있으며, 서버 구동시 생성되며 데이터 변경(유저 접속/퇴장, 위치 이동등)시 각 클라이언트에 broadcast 됩니다. 

```typescript
declare module "ZEPETO.Multiplay.Schema" {
    interface State extends Schema {
        players: MapSchema<Player>;
    }
    class Player extends Schema {
        sessionId: string;
        zepetoHash: string;
        zepetoUserId: string;
        transform: Transform;
        state: number;
    }
    class Transform extends Schema {
        position: Vector3;
        rotation: Vector3;
    }
    class Vector3 extends Schema {
        x: number;
        y: number;
        z: number;
    }
}
```
Schema > Player class는 World에 접속한 유저의 현재 상태를 나타내며, 유저의 인증정보(sessionId, zepetoHash, zepetoUserId)와 캐릭터 위치정보(transform), 그리고 캐릭터 모션상태(state)를 담고 있습니다.

<br/><br/>

## 게임 로직 작성하기
#### Room 입장 및 캐릭터 초기화
Room 생성 / 입장 / 캐릭터 생성 처리 코드입니다.

- [Server](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/World.multiplay/index.ts#L11)<br/>
Server에 처음 Player가 접속할 때 Room객체가 생성되고 onCreate 이벤트가 호출됩니다. 

onJoin 이벤트는 Room에 새로운 Player가 입장할 때 마다 호출됩니다. 해당 이벤트에 새로운 Player의 StateObject를 생성해 State에 추가 합니다. 

```typescript
onCreate(options: SandboxOptions) {

    this.onMessage("onChangedTransform", (client, message) => { ... });	
	this.onMessage("onChangedState", (client, message) => { ... });
}

async onJoin(client: SandboxPlayer) {

    // Room에 입장한 player의 StateObject를 생성해 초기화합니다.
    const player = new Player();
    player.sessionId = client.sessionId;

    //DataStoage를 통해, (이전에 접속했던 player일 경우) 마지막 위치정보를 가져옵니다.
    const storage: DataStorage = client.loadDataStorage();
    const raw_val = await storage.get("transform") as string;

    const transform = new Transform();
    ...
    player.transform = transform;

    // sessionId를 key로 하여, player state를 관리합니다.
    this.state.players.set(client.sessionId, player);
}
```

- [Client](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L14) </br>
Player가 Room에 입장하면 RoomCreated와 RoomJoined 이벤트가 호출됩니다.
Room에 입장이 완료되면 서버 상태 변경을 수신하기 위해서 OnStateChage(State, isFirst:true)에 이벤트를 등록합니다. 

```typescript
Start()
{
    this.multiplay.RoomCreated += (room: Room) => {
        this.room = room;
    };

    this.multiplay.RoomJoined += (room: Room) => {
        room.OnStateChange += this.OnStateChange;
    };
}


OnStateChange(state: State, isFirst: boolean) {

    ...
 
    let join = new Map<string, Player>();
 
    state.players.ForEach((sessionId: string, player: Player) => {
       
        // Room에 새로 입장한 player를 확인합니다.
        if (!this.currentPlayers.has(sessionId))
            join.set(sessionId, player);    
        ...
    });
 
    ...
    // [RoomState] Room에 입장한 player 인스턴스 생성
    join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));
}
```

Room에 새로운 플레이가 입장할때 에벤트를 수신 할 수 있도록 player 객체에 OnJoinPlayer 이벤트를 연결합니다. 
OnJoinPlayer 호출시 해당 플레이어용 CharacterController instance를 생성하고, 캐릭터 로딩 이벤트(OnAddedPlayer / OnAddedLocalPlayer)를 연결합니다.

```typescript
OnJoinPlayer(sessionId: string, player: Player) {

    ...

    // 1) isLocal(boolean) Flag에 따라, Local Player 인스턴스를 선택적으로 생성합니다.
    ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
}


OnStateChange(state: State, isFirst: boolean) {

    if (isFirst) {
		...

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            // 2) (Local)Player 인스턴스가 완전히 Scene에 로드되었을 때, 호출됩니다.
        });

        ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
            // 2) (Local/Normal)Player 인스턴스가 완전히 Scene에 로드 되었을 때, 호출됩니다. 
        });
    }
}
```

#### Player 위치 동기화하기
Room내에 Player들의 위치와 상태를  Sync. 하는 로직입니다. 

- Server<br/>
개별 클라이언트의 위치를 수신 받을수 있도록 'onChangedTransform' 메시지 리스너를 생성합니다. onChangedTransform 메시지가 수신되면, 서버의 player state를 변경하도록 로직을 추가합니다. 이때 변경된 서버 상태는 클라이언트의 onStateChange로 전달됩니다. 
```
onCreate(options: SandboxOptions) {

    // 캐릭터 위치 갱신(onChangedTransform) 이벤트 메시지 핸들러를 등록합니다.  
    this.onMessage("onChangedTransform", (client, message) => {
        const player = this.state.players.get(client.sessionId); 
        const transform = new Transform();

        ...    
        player.transform = transform;
    });
}
```

- Client<br/>
1. [내 캐릭터 위치 정보 전달하기](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L108) </br>
내 캐릭터(local player)의 위치를 서버에 업데이트 하려면, RoomdData 객체에 캐릭터 위치를 업데이트 한 후, onChangedTransform를 키워드로 전달합니다. 캐릭터의 상태나 인벤토리 설정등과 같은 정보도 자유롭게 정의하여 전달 할 수 있습니다.

```typescript
private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();
 
        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
 
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());
 
        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }
```

2. [다른 캐릭터 위치 수신 하기](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L74)</br>
OnStateChange 이벤트 함수는 서버에서 State (캐릭터 상태 또는 위치)가 변경시 호출됩니다. 수신된 캐릭터의 State를 로컬에 생성된 CharacterController instance에 업데이트 합니다. 

```typescript
 playerState.OnChange += (changedValues) => {
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        ...
        const position = this.ParseVector3(playerState.transform.position);
        zepetoPlayer.character.MoveToPosition(position);
 
        if (playerState.state === CharacterState.JumpIdle || playerState.state === CharacterState.JumpMove)
                zepetoPlayer.character.Jump();
        ...
  };
```
<br/>

#### Room 퇴장
Room에서 Player가 퇴장할 때 필요한 로직을 삽입합니다.
- [Server](https://github.com/naverz/zepeto-multiplay-example/blob/774ec92ccc3cca7ceb6ccbf5d6ee6ac2c15363c4/Assets/World.multiplay/index.ts#L92) </br>
Player가 Room을 떠날때 onLeave이벤트가 호출됩니다. 이때 해당 player를 State>players 목록에서 제거합니다. 

```typescript
async onLeave(client: SandboxPlayer, consented ?: boolean) {
 
    // 퇴장 Player Storage Load
    const storage: DataStorage = client.loadDataStorage();
    const player = this.state.players.get(client.sessionId);
    ...  
 
    const transform = {
        position: { x: position.x, y: _pos.y, z: _pos.z },
        ...
    };
 
    // 퇴장하는 유저의 transform을 json 형태로 저장한 다음, 재접속 시 load 합니다.
    await storage.set("transform", JSON.stringify(transform));
 
    // sessionId에 해당하는 player를 state에서 제거합니다.
    this.state.players.delete(client.sessionId);
}
```

- [Client](https://github.com/naverz/zepeto-multiplay-example/blob/774ec92ccc3cca7ceb6ccbf5d6ee6ac2c15363c4/Assets/ZepetoScripts/ClientStarter.ts#L85) </br>
Player가 Room을 떠나면 서버 로직에서 player state를 변경합니다. 변경된 state정보는 클라이언트에 등록된 onStateChange 이벤트로 호출됩니다. 
이때 클라이언트 코드내에 ZepetoPlayers instance에서도 퇴장된 캐릭터를 삭제합니다. 

```typescript
OnStateChange(state: State, isFirst: boolean) {
 
    ...
    let leave = new Map<string, Player>(this.currentPlayers);
 
    state.players.ForEach((sessionId: string, player: Player) => { 
         
        ...
        leave.delete(sessionId);
    });
 
    ...
    // [RoomState] Room에서 퇴장한 player 인스턴스 제거
    leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
}
 
OnLeavePlayer(sessionId: string, player: Player) {
    this.currentPlayers.delete(sessionId);
    ZepetoPlayers.instance.RemovePlayer(sessionId);
}
```

<br/><br/>

## Additional Samples

[ScreenShotSample](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/README.md)
