import { SandboxPlayer } from "ZEPETO.Multiplay";
import Server from "..";

export abstract class IModule {
    private readonly _server: Server;
    protected get server(): Server { return this._server; }
    constructor(server: Server) {
        this._server = server;
    }
    abstract OnCreate(): Promise<void>;
    abstract OnJoin(client: SandboxPlayer): Promise<void>;
    abstract OnLeave(client: SandboxPlayer): Promise<void>;
    abstract OnTick(deltaTime: number): void;
}