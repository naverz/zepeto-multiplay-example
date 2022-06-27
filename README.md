# zepeto-multiplay-example

![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/preview.gif)

This is a multiplayer demo project using the development server. Before proceeding, please follow the following guide to set up your world console settings in advance: [ZEPETO login](https://studio.zepeto.me/us/guides/preparing-for-world-creating).
>개발 서버를 이용한 멀티플레이 데모 프로젝트입니다. 프로젝트를 실행하려면 사전에 [ZEPETO 로그인](https://studio.zepeto.me/kr/guides/preparing-for-world-creating)을 진행해야 합니다.



<br/><br/>

## Overview
This is an example written based on [ZEPETO Multiplay](https://studio.zepeto.me/kr/guides/multiplay) and [Character Controller](https://studio.zepeto.me/kr/guides/character-control). The state of the currently connected Room (character info/location of each player, etc.) is defined in [Schema file](https://studio.zepeto.me/kr/guides/multiplay-room-state) within the ZEPETO Multiplay package. The schema data is passed each client as an onStateChange event callback.
>[ZEPETO Multiplay](https://studio.zepeto.me/kr/guides/multiplay)와  [Character Controller](https://studio.zepeto.me/kr/guides/character-control) 기반으로 작성된 예제입니다. 현재 접속중인 Room의 상태 (각 플레이어의 캐릭터 정보와 위치등)는 ZEPETO Multiplay 패키지내에 [Schema file](https://studio.zepeto.me/kr/guides/multiplay-room-state)에 정의되어 있으며 이를 각 클라이언트에 onStateChange 이벤트 콜백으로 전달하는 구조입니다. 

- If you are connecting from another development PC, please refer to the Server Environment by IP Address section.
>다른 개발 pc에서 접속할 경우, IP 주소로 서버 환경 설정 항목을 참고하세요.
[Connect Multiplay through IP](https://studio.zepeto.me/kr/guides/accessing-to-multiplay-ip-addresses)

- If you are connecting with a mobile device, please refer to the QR code generation section.
>모바일기기로 접속할 경우, QR코드 생성 항목을 참고하세요. 
 [Conect from mobile device](https://studio.zepeto.me/kr/guides/getting-started-with-templates)

<br/><br/>

## Scenes

- Sample Scene <br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Sample.png)<br/>
[https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/SampleScene.unity](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/SampleScene.unity)<br/><br/><br/><br/>

- Theme Scene <br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Desert.JPG)<br/>
1. Desert Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/001_Desert.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Sakura.JPG)<br/>
2. Sakura Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/002_Sakura.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/ClassRoom.JPG)<br/>
3. Classroom Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/003_ClassRoom.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Camping.JPG)<br/>
4. Camping Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/004_Camping.unity<br/><br/><br/><br/>
![Image of preview](https://github.com/naverz/zepeto-multiplay-example/blob/main/doc/Fall.JPG)<br/>
5. Fall Scene : https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Scenes/ThemeScenes/005_Fall.unity<br/><br/><br/><br/>


<br/><br/>



## Additional Samples

[ScreenShotSample](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/Resources/ScreenShot/doc/README.md)

[TPS View](https://github.com/naverz/zepeto-multiplay-example/tree/main/Assets/Scenes/TPSView)

[Quearter View](https://github.com/naverz/zepeto-multiplay-example/tree/main/Assets/Scenes/QuarterView)

[Side View](https://github.com/naverz/zepeto-multiplay-example/tree/main/Assets/Scenes/SideView)



<br/><br/>

## Multiplay Guide Video Tutorials
[ Part 1 : Setting up multiplayer ]
- Learn to set up the environment for multiplayer development for both client and server. 
>멀티플레이 서버 생성부터 클라이언트 생성까지, 멀티플레이 월드 개발을 위한 환경 설정을 진행합니다.
- 🎥 Watch Video : https://youtu.be/S68B1TMa-A8
- [![🎥 Watch Video](https://user-images.githubusercontent.com/100118650/158537409-9a3e7db0-94ab-4a49-b923-ad88471af747.png)](https://youtu.be/S68B1TMa-A8)



[ Part 2 : Writing World Logic 1 ]
Learn about the schema required for communication between server and client, and define Schema Types and Room State.
>서버, 클라이언트 간 통신을 위해 필요한 Schema에 대해 알아보고, Schema Types와 Room State를 정의합니다.
- 🎥 Watch Video : https://youtu.be/tfkY_raboV0
- [![🎥 Watch Video](https://user-images.githubusercontent.com/100118650/158537497-e02505af-a488-406b-946b-44a208e204be.png)](https://youtu.be/tfkY_raboV0)



[ Part 3 : Writing World Logic 2 ] 
- Learn about synchronizing the player's location and handling player disconnects.
>플레이어의 위치 동기화부터 플레이어의 퇴장까지를 진행합니다.
- 🎥 Watch Video : https://youtu.be/H92Gd2G9DhM
- [![🎥 Watch Video](https://user-images.githubusercontent.com/100118650/158537541-5b94e32d-551d-4d22-9165-30bbe47330b9.png)](https://youtu.be/H92Gd2G9DhM)



[ Part 4 : Start the server and connect to multiplayer ] 
In this part, we learn to connect to the server to test our multiplayer environment.
>이번 편에서는 서버를 구동하고 접속하여 멀티플레이를 진행합니다.
-  🎥 Watch Video : https://youtu.be/FmK6JNlSjJA
-  [![🎥 Watch Video](https://user-images.githubusercontent.com/100118650/158537599-49231f7b-2d93-4f79-be2c-64da4cc2657e.png)](https://youtu.be/FmK6JNlSjJA)


[ Part 5 : Deep multiplayer: IWP server interworking and server DataStorage ]
We learn to take advantage of IWP and DataStorage options available in multiplayer.
>멀티플레이에서 사용 가능한 IWP와 DataStorage를 활용해봅니다.
-  🎥 Watch Video : https://youtu.be/d-MaqjP-vjA
-  [![🎥 Watch Video](https://user-images.githubusercontent.com/100118650/158537639-0a70a9b3-bf1d-4003-85c1-4540b9290861.png)](https://youtu.be/d-MaqjP-vjA)





<br/><br/>

## Define Room State 
"State" is a data structure for managing player information of the room being accessed, as well as other information such as the location of other players/objects.
>State는 접속 중인 Room의 플레이어 정보, 플레이어 또는 오브젝트의 위치 등을 관리하기 위한 data structure 입니다. 
"States" are defined in the [schema file](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/World.multiplay/schemas.json) in the Multiplay package, and is created when the server is started. When data is modified, they are broadcast to each client. (When user enters/exits, location change, etc.).
>Multiplay 패키지내에 [schema 파일](https://github.com/naverz/zepeto-multiplay-example/blob/main/Assets/World.multiplay/schemas.json)에 정의되어 있으며, 서버 구동시 생성되며 데이터 변경(유저 접속/퇴장, 위치 이동등)시 각 클라이언트에 broadcast 됩니다. 

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
Schema > Player class indicates the current state of the user connected to the World, and contains user authentication information (sessionId, zepetoHash, zepetoUserId), character location information (transform), and character motion state (state).
>Schema > Player class는 World에 접속한 유저의 현재 상태를 나타내며, 유저의 인증정보(sessionId, zepetoHash, zepetoUserId)와 캐릭터 위치정보(transform), 그리고 캐릭터 모션상태(state)를 담고 있습니다.

<br/><br/>

## Writing Game Logic
#### Joining Room & Character Initialization
Room creation / entry / character creation processing code.
>Room 생성 / 입장 / 캐릭터 생성 처리 코드입니다.

[Server](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/World.multiplay/index.ts#L11)<br/>
- When the player connects to the server for the first time, a Room object is created and the onCreate event is called.
>- Server에 처음 Player가 접속할 때 Room객체가 생성되고 onCreate 이벤트가 호출됩니다. 

- The onJoin event is called whenever a new player enters the room. Create a StateObject for the new Player in the event and add it to the State.
>- onJoin 이벤트는 Room에 새로운 Player가 입장할 때 마다 호출됩니다. 해당 이벤트에 새로운 Player의 StateObject를 생성해 State에 추가 합니다. 

```typescript
onCreate(options: SandboxOptions) {

    this.onMessage("onChangedTransform", (client, message) => { ... });	
	this.onMessage("onChangedState", (client, message) => { ... });
}

async onJoin(client: SandboxPlayer) {

    //Create a StateObject for the player that entered the room.
    const player = new Player();
    player.sessionId = client.sessionId;

    //In the case of a recently connected player, grab the last location information local data storage.
    const storage: DataStorage = client.loadDataStorage();
    const raw_val = await storage.get("transform") as string;

    const transform = new Transform();
    ...
    player.transform = transform;

    // Using the sessionId as a key, store the player state for the player. 
    this.state.players.set(client.sessionId, player);
}
```

[Client](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L14) </br>
- When a Player enters a Room, the RoomCreated and RoomJoined events are called.
>- Player가 Room에 입장하면 RoomCreated와 RoomJoined 이벤트가 호출됩니다.
- Register an event in OnStateChage(State, isFirst:true) to receive server state changes upon room entry. 
>- Room에 입장이 완료되면 서버 상태 변경을 수신하기 위해서 OnStateChage(State, isFirst:true)에 이벤트를 등록합니다. 

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
       
        // Check if the player is new to the room. 
        if (!this.currentPlayers.has(sessionId))
            join.set(sessionId, player);    
        ...
    });
 
    ...
    // [RoomState] Create a player instance for the player that entered the room.
    join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));
}
```
- Connect the OnJoinPlayer event to the player object so that it can receive events when a new player enters the room.
>- Room에 새로운 플레이가 입장할때 에벤트를 수신 할 수 있도록 player 객체에 OnJoinPlayer 이벤트를 연결합니다. 
- When OnJoinPlayer is called, a CharacterController instance for the player is created and the character loading event (OnAddedPlayer / OnAddedLocalPlayer) is initialized.
>- OnJoinPlayer 호출시 해당 플레이어용 CharacterController instance를 생성하고, 캐릭터 로딩 이벤트(OnAddedPlayer / OnAddedLocalPlayer)를 연결합니다.

```typescript
OnJoinPlayer(sessionId: string, player: Player) {

    ...

    // 1) Create a player instance based on the isLocal(boolean) flag 
    ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
}


OnStateChange(state: State, isFirst: boolean) {

    if (isFirst) {
		...

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            // 2) Called when the (Local)Player instance is completely loaded.
        });

        ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
            // 2) Called when a (Local/Normal)Player instance is completely loaded.
        });
    }
}
```

#### Synchronize Player Positions
This is the logic to synchronize the location and status of players in the room.
>Room내에 Player들의 위치와 상태를  Sync 하는 로직입니다. 

- Server<br/>
- Create an 'onChangedTransform' message listener to receive the location of individual clients. Add logic to change the server's player state when the onChangedTransform message is received. The changed server state is then passed to the client's onStateChange.
>- 개별 클라이언트의 위치를 수신 받을수 있도록 'onChangedTransform' 메시지 리스너를 생성합니다. onChangedTransform 메시지가 수신되면, 서버의 player state를 변경하도록 로직을 추가합니다. 이때 변경된 서버 상태는 클라이언트의 onStateChange로 전달됩니다. 

```typescript
onCreate(options: SandboxOptions) {

    // Register an event message for transform updates (onChangedTransform) 
    this.onMessage("onChangedTransform", (client, message) => {
        const player = this.state.players.get(client.sessionId); 
        const transform = new Transform();

        ...    
        player.transform = transform;
    });
}
```

- Client<br/>
- 1. [Send Character location information](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L108) </br>

- To update the position of my character (local player) to the server, after updating the position of the character in the `RoomData` object, pass `"onChangedTransform"` as a keyword. Information such as character status and inventory settings can also be freely defined and delivered.
>- 내 캐릭터(local player)의 위치를 서버에 업데이트 하려면, RoomData 객체에 캐릭터 위치를 업데이트 한 후, onChangedTransform를 키워드로 전달합니다. 캐릭터의 상태나 인벤토리 설정등과 같은 정보도 자유롭게 정의하여 전달 할 수 있습니다.

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

- 2. [Sync other players location information](https://github.com/naverz/zepeto-multiplay-example/blob/77128679e86dcee15816b060b9809033dc2a8bc0/Assets/ZepetoScripts/ClientStarter.ts#L74)</br>
- The OnStateChange event function is called when the State (character state or position) changes on the server. Update the received character's State to the locally created CharacterController instance.
>- OnStateChange 이벤트 함수는 서버에서 State (캐릭터 상태 또는 위치)가 변경시 호출됩니다. 수신된 캐릭터의 State를 로컬에 생성된 CharacterController instance에 업데이트 합니다. 

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

#### Leaving the Room 
Logic for when the player leaves the room.
>Room에서 Player가 퇴장할 때 필요한 로직을 삽입합니다.
- [Server](https://github.com/naverz/zepeto-multiplay-example/blob/774ec92ccc3cca7ceb6ccbf5d6ee6ac2c15363c4/Assets/World.multiplay/index.ts#L92) </br>
- The onLeave event is called when the player leaves the room and removes the player from the State>players list.
>- Player가 Room을 떠날때 onLeave이벤트가 호출됩니다. 이때 해당 player를 State>players 목록에서 제거합니다. 

```typescript
async onLeave(client: SandboxPlayer, consented ?: boolean) {
 
    // Load Player storage for disconnected Player
    const storage: DataStorage = client.loadDataStorage();
    const player = this.state.players.get(client.sessionId);
    ...  
 
    const transform = {
        position: { x: position.x, y: _pos.y, z: _pos.z },
        ...
    };
 
    // Convert transform information to json format then save the value to storage.
    await storage.set("transform", JSON.stringify(transform));
 
    //Delete the player state based on the sessionId key.
    this.state.players.delete(client.sessionId);
}
```

- [Client](https://github.com/naverz/zepeto-multiplay-example/blob/774ec92ccc3cca7ceb6ccbf5d6ee6ac2c15363c4/Assets/ZepetoScripts/ClientStarter.ts#L85) </br>
- When the player leaves the room, the server logic changes the player state. The changed state information is called with the onStateChange event registered in the client.
>- Player가 Room을 떠나면 서버 로직에서 player state를 변경합니다. 변경된 state정보는 클라이언트에 등록된 onStateChange 이벤트로 호출됩니다. 
We then delete the disconnected character from the ZepetoPlayers instance in the client code.
>- 이때 클라이언트 코드내에 ZepetoPlayers instance에서도 퇴장된 캐릭터를 삭제합니다. 

```typescript
OnStateChange(state: State, isFirst: boolean) {
 
    ...
    let leave = new Map<string, Player>(this.currentPlayers);
 
    state.players.ForEach((sessionId: string, player: Player) => { 
         
        ...
        leave.delete(sessionId);
    });
 
    ...
    // [RoomState] Delete player instance for disconnected players. 
    leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
}
 
OnLeavePlayer(sessionId: string, player: Player) {
    this.currentPlayers.delete(sessionId);
    ZepetoPlayers.instance.RemovePlayer(sessionId);
}
```

