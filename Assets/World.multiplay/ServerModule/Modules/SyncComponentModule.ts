/* version info 1.0.2 */

import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {sVector3, sQuaternion, SyncTransform, PlayerAdditionalValue, ZepetoAnimationParam} from "ZEPETO.Multiplay.Schema";

export default class SyncComponentModule extends IModule {
    private sessionIdQueue: string[] = [];
    private InstantiateObjCaches : InstantiateObj[] = [];
    private masterClient: Function = (): SandboxPlayer | undefined => this.server.loadPlayer(this.sessionIdQueue[0]);
    
    async OnCreate() {
        /**Zepeto Player Sync**/
        this.server.onMessage(MESSAGE.SyncPlayer, (client, message) => {
            const player = this.server.state.players.get(client.sessionId);
            if(player) {
                /** State **/
                    //animation param
                const animationParam = new ZepetoAnimationParam();
                animationParam.State = message.animationParam.State;
                animationParam.MoveState = message.animationParam.MoveState;
                animationParam.JumpState = message.animationParam.JumpState;
                animationParam.LandingState = message.animationParam.LandingState;
                animationParam.MotionSpeed = message.animationParam.MotionSpeed;
                animationParam.FallSpeed = message.animationParam.FallSpeed;
                animationParam.Acceleration = message.animationParam.Acceleration;
                animationParam.MoveProgress = message.animationParam.MoveProgress;
                player.animationParam = animationParam;

                player.gestureName = message.gestureName; // Gesture Sync

                //additional Value
                if (message.playerAdditionalValue != null) {
                    const pAdditionalValue = new PlayerAdditionalValue();
                    pAdditionalValue.additionalWalkSpeed = message.playerAdditionalValue.additionalWalkSpeed;
                    pAdditionalValue.additionalRunSpeed = message.playerAdditionalValue.additionalRunSpeed;
                    pAdditionalValue.additionalJumpPower = message.playerAdditionalValue.additionalJumpPower;
                    player.playerAdditionalValue = pAdditionalValue;
                }
            }
        });

        /**Transform Sync**/
        this.server.onMessage(MESSAGE.SyncTransform, (client, message) => {
            if (!this.server.state.SyncTransforms.has(message.Id)) {
                const syncTransform = new SyncTransform();
                this.server.state.SyncTransforms.set(message.Id.toString(), syncTransform);
            }
            const syncTransform = this.server.state.SyncTransforms.get(message.Id);
            if(syncTransform !== undefined) {
                syncTransform.Id = message.Id;
                syncTransform.position = new sVector3();
                syncTransform.position.x = message.position.x;
                syncTransform.position.y = message.position.y;
                syncTransform.position.z = message.position.z;

                syncTransform.localPosition = new sVector3();
                syncTransform.localPosition.x = message.localPosition.x;
                syncTransform.localPosition.y = message.localPosition.y;
                syncTransform.localPosition.z = message.localPosition.z;

                syncTransform.rotation = new sQuaternion();
                syncTransform.rotation.x = message.rotation.x;
                syncTransform.rotation.y = message.rotation.y;
                syncTransform.rotation.z = message.rotation.z;
                syncTransform.rotation.w = message.rotation.w;

                syncTransform.scale = new sVector3();
                syncTransform.scale.x = message.scale.x;
                syncTransform.scale.y = message.scale.y;
                syncTransform.scale.z = message.scale.z;

                syncTransform.sendTime = message.sendTime;
            }
        });
        this.server.onMessage(MESSAGE.SyncTransformStatus, (client, message) => {
            const syncTransform = this.server.state.SyncTransforms.get(message.Id);
            if(syncTransform !== undefined)
                syncTransform.status = message.Status;
        });

        this.server.onMessage(MESSAGE.ChangeOwner, (client,message:string) => {
            this.server.broadcast(MESSAGE.ChangeOwner+message, client.sessionId);
        });
        this.server.onMessage(MESSAGE.Instantiate, (client,message:InstantiateObj) => {
            const InstantiateObj: InstantiateObj = {
                Id: message.Id,
                prefabName: message.prefabName,
                ownerSessionId: message.ownerSessionId,
                spawnPosition: message.spawnPosition,
                spawnRotation: message.spawnRotation,
            };
            this.InstantiateObjCaches.push(InstantiateObj);
            this.server.broadcast(MESSAGE.Instantiate, InstantiateObj);
        });
        this.server.onMessage(MESSAGE.RequestInstantiateCache, (client) => {
            this.InstantiateObjCaches.forEach((obj)=>{
                client.send(MESSAGE.Instantiate, obj);
            });
        });

        /**SyncDOTween**/
        this.server.onMessage(MESSAGE.SyncDOTween, (client, message: syncTween) => {
            const tween: syncTween = {
                Id: message.Id,
                position: message.position,
                nextIndex: message.nextIndex,
                loopCount: message.loopCount,
                sendTime: message.sendTime,
            };
            const masterClient = this.masterClient();
            if (masterClient !== null && masterClient !== undefined) {
                this.server.broadcast(MESSAGE.ResponsePosition + message.Id, tween, {except: masterClient});
            }
        });

        /**Common**/
        this.server.onMessage(MESSAGE.CheckServerTimeRequest, (client, message) => {
            let Timestamp = +new Date();
            client.send(MESSAGE.CheckServerTimeResponse, Timestamp);
        });
        this.server.onMessage(MESSAGE.CheckMaster, (client, message) => {
            console.log(`master->, ${this.sessionIdQueue[0]}`);
            this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
        });
        this.server.onMessage(MESSAGE.PauseUser, (client) => {
            if(this.sessionIdQueue.includes(client.sessionId)) {
                const pausePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
                this.sessionIdQueue.splice(pausePlayerIndex, 1);

                if (pausePlayerIndex == 0) {
                    console.log(`master->, ${this.sessionIdQueue[0]}`);
                    this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
                }
            }
        });
        this.server.onMessage(MESSAGE.UnPauseUser, (client) => {
            if(!this.sessionIdQueue.includes(client.sessionId)) {
                this.sessionIdQueue.push(client.sessionId);
                this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        });

        /** Sample Code **/
        this.server.onMessage(MESSAGE.BlockEnter, (client,transformId:string) => {
            this.server.broadcast(MESSAGE.BlockEnter+transformId, client.sessionId);
        });
        this.server.onMessage(MESSAGE.BlockExit, (client,transformId:string) => {
            this.server.broadcast(MESSAGE.BlockExit+transformId, client.sessionId);
        });
        this.server.onMessage(MESSAGE.SendBlockEnterCache, (client,blockCache) => {
            this.server.loadPlayer(blockCache.newJoinSessionId)?.send(MESSAGE.BlockEnter+blockCache.transformId, client.sessionId);
        });

        this.server.onMessage(MESSAGE.CoinAcquired, (client,transformId:string) => {
            this.masterClient()?.send(MESSAGE.CoinAcquired+transformId, client.sessionId);
        });

        /** Racing Game **/
        let isStartGame:boolean = false;
        let startServerTime:number;
        this.server.onMessage(MESSAGE.StartRunningRequest, (client) => {
            if(!isStartGame) {
                isStartGame = true;
                startServerTime = +new Date();

                this.server.broadcast(MESSAGE.CountDownStart, startServerTime);
            }
        });
        this.server.onMessage(MESSAGE.FinishPlayer, (client,finishTime:number) => {
            let playerLapTime = (finishTime-startServerTime)/1000;
            console.log(`${client.sessionId}is enter! ${playerLapTime}`);
            const gameReport: GameReport = {
                playerUserId: client.userId,
                playerLapTime: playerLapTime,
            };
            this.server.broadcast(MESSAGE.ResponseGameReport, gameReport);
            if(isStartGame) {
                isStartGame = false;
                let gameEndTime:number = +new Date();
                this.server.broadcast(MESSAGE.FirstPlayerGetIn, gameEndTime);
            }
        });
    }

    async OnJoin(client: SandboxPlayer) {
        if(!this.sessionIdQueue.includes(client.sessionId)) {
            this.sessionIdQueue.push(client.sessionId.toString());
        }
    }

    async OnLeave(client: SandboxPlayer) {
        if(this.sessionIdQueue.includes(client.sessionId)) {
            const leavePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
            this.sessionIdQueue.splice(leavePlayerIndex, 1);
            if (leavePlayerIndex == 0) {
                console.log(`master->, ${this.sessionIdQueue[0]}`);
                this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        }
    }

    OnTick(deltaTime: number) {
    }

}
interface syncTween {
    Id: string,
    position: sVector3,
    nextIndex: number,
    loopCount: number,
    sendTime: number,
}

interface InstantiateObj{
    Id:string;
    prefabName:string;
    ownerSessionId?:string;
    spawnPosition?:sVector3;
    spawnRotation?:sQuaternion;
}

/** racing game **/
interface GameReport{
    playerUserId : string;
    playerLapTime : number;
}

enum MESSAGE {
    SyncPlayer = "SyncPlayer",
    SyncTransform = "SyncTransform",
    SyncTransformStatus = "SyncTransformStatus",
    ChangeOwner = "ChangeOwner",
    Instantiate = "Instantiate",
    RequestInstantiateCache = "RequestInstantiateCache",
    ResponsePosition = "ResponsePosition",
    SyncDOTween = "SyncDOTween",
    CheckServerTimeRequest = "CheckServerTimeRequest",
    CheckServerTimeResponse = "CheckServerTimeResponse",
    CheckMaster = "CheckMaster",
    MasterResponse = "MasterResponse",
    PauseUser = "PauseUser",
    UnPauseUser = "UnPauseUser",

    /** Sample Code **/
    BlockEnter = "BlockEnter",
    BlockExit = "BlockExit",
    SendBlockEnterCache = "SendBlockEnterCache",
    CoinAcquired = "CoinAcquired",

    /** Racing Game **/
    StartRunningRequest = "StartRunningRequest",
    FinishPlayer = "FinishPlayer",
    FirstPlayerGetIn = "FirstPlayerGetIn",
    CountDownStart = "CountDownStart",
    ResponseGameReport = "ResponseGameReport"
}
