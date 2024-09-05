import { GameObject, Object } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Content } from 'ZEPETO.World';

export default class ToolClassGather extends ZepetoScriptBehaviour {

    public TfHelpers: any[] = [];
    public DtHelpers: any[] = [];
    public AnimHelper: any[] = [];

    public ZPMGestureAPIContents:Map<string,Content> =  new Map<string, Content>();

    private static _instance: ToolClassGather;
    public static get Instance(): ToolClassGather {
        return ToolClassGather._instance;
    }

    Awake() {
        ToolClassGather._instance = this;
    }

}