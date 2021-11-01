# zepeto-script-sample
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/preview.gif)


개발 서버를 이용한 멀티플레이 데모 프로젝트입니다. 프로젝트를 실행하려면 사전에 [ZEPETO 로그인](https://wiki.navercorp.com/pages/viewpage.action?pageId=635965635)을 진행해야 합니다.


<br/><br/>

## Overview
[ZEPETO Multiplay](https://wiki.navercorp.com/display/WIT/4.+Multiplay)와  [Character Controller](https://wiki.navercorp.com/display/WIT/2.+Character+Control) 기반으로 작성된 예제입니다. 현재 접속중인 Room의 상태 (각 플레이어의 캐릭터 정보와 위치등)는 ZEPETO Multiplay 패키지내에 [Schema file](https://wiki.navercorp.com/display/WIT/4-3.+Multiplay+Room+State)에 정의되어 있으며 이를 각 클라이언트에 onStateChange 이벤트 콜백으로 전달하는 구조입니다. 

- 다른 개발 pc에서 접속할 경우, IP 주소로 서버 환경 설정 항목을 참고하세요.
[Multiplay IP 주소로 접속하기](https://wiki.navercorp.com/pages/viewpage.action?pageId=658580057)

- 모바일기기로 접속할 경우, QR코드 생성 항목을 참고하세요. 
 [템플릿으로 시작하기](https://wiki.navercorp.com/pages/viewpage.action?pageId=615610112)


<br/><br/>

## Room State 정의하기
State는 접속 중인 Room의 플레이어 정보, 플레이어 또는 오브젝트의 위치 등을 관리하기 위한 data structure 입니다. 
Multiplay 패키지내에 [schema 파일](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/World.multiplay/schemas.json)에 정의되어 있으며, 서버 구동시 생성되며 데이터 변경(유저 접속/퇴장, 위치 이동등)시 각 클라이언트에 broadcast 됩니다. 

```
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

```
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

- [Client](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L14)
```
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

    // Client가 Server에 접속한 다음, isFirst(true) Flag와 함께 전체 State를 1회 수신합니다.
    if (isFirst) {

        // 현재 Room에 존재하는 player를 생성합니다.
        state.players.ForEach((sessionId: string, player: Player) => this.OnJoinPlayer(sessionId, player));

        // 이후 Room에 입장하는 player를 생성하기 위해 이벤트 핸들러를 등록합니다.
        state.players.OnAdd += (player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player);
		
		...
    }
}
```

Room에 새로운 플레이가 입장할때 에벤트를 수신 할 수 있도록 player 객체에 OnJoinPlayer 이벤트를 연결합니다. 
OnJoinPlayer 호출시 해당 플레이어용 CharacterController instance를 생성하고, 캐릭터 로딩 이벤트(OnAddedPlayer / OnAddedLocalPlayer)를 연결합니다.
```
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
```
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

```
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
- Server

```
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

- Client-Side
```
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
