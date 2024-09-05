import { SandboxPlayer } from "ZEPETO.Multiplay";
// import Server from "..";

export abstract class IModule {
    private readonly _server: any;
    protected get server(): any { return this._server; }
    constructor(server: any) {
        this._server = server;
    }
    abstract OnCreate(): Promise<void>;
    abstract OnJoin(client: SandboxPlayer): Promise<void>;
    abstract OnLeave(client: SandboxPlayer): Promise<void>;
    abstract OnTick(deltaTime: number): void;
}