import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { SpawnInfo, ZepetoPlayers } from 'ZEPETO.Character.Controller'
import { WorldService } from 'ZEPETO.World'

export default class BasicCharacterSpawn extends ZepetoScriptBehaviour {

    Start() 
    {
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId, new SpawnInfo(), true);
    }

}
