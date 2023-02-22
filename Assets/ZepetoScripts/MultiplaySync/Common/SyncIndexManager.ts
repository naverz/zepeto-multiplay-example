import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SyncIndexManager extends ZepetoScriptBehaviour {
    /** This is used to give a unique ID to synchronization objects that do not have a separate ID. */
    public static SyncIndex:number = 0;

}