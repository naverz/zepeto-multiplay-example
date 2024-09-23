import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";

export default class MannequinModule extends IModule {
    private ChangedItems: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

    async OnCreate() {
        this.ChangedItems = new Map<string, Map<string, string>>();

        // 타입 인수를 제거한 onMessage 호출
        this.server.onMessage(MESSAGE.OnChangedItem, (client: SandboxPlayer, message: CharacterItem[]) => {
            // Update or add new items
            if (this.ChangedItems.has(client.userId)) {
                const changedItemMap = this.ChangedItems.get(client.userId);
                for (const characterItem of message) {
                    // If dress (22) is updated, remove top (19) and bottom (20)
                    if (characterItem.property == Cloth.DRESS) {
                        if (changedItemMap?.has(Cloth.TOP)) {
                            changedItemMap.delete(Cloth.TOP);
                        }
                        if (changedItemMap?.has(Cloth.BOTTOM)) {
                            changedItemMap.delete(Cloth.BOTTOM);
                        }
                    }
                    // If top (19) or bottom (20) is updated, remove dress (22)
                    else if (characterItem.property == Cloth.TOP || characterItem.property == Cloth.BOTTOM) {
                        if (changedItemMap?.has(Cloth.DRESS)) {
                            changedItemMap.delete(Cloth.DRESS);
                        }
                    }

                    changedItemMap?.set(characterItem.property, characterItem.id);
                    console.log(`OnChangedItem old ${client.userId} : ${characterItem.property} // ${characterItem.id}`);
                }
            }
            // First registration
            else {
                let changedItemMap: Map<string, string> = new Map<string, string>();
                for (const characterItem of message) {
                    changedItemMap.set(characterItem.property, characterItem.id);
                }
                this.ChangedItems.set(client.sessionId, changedItemMap);
            }

            const changedItem: ChangedItem = {
                sessionId: client.sessionId,
                characterItems: message
            };

            console.log(`OnChangedItem :  ${changedItem.sessionId}`);
            for (const characterItem of changedItem.characterItems) {
                console.log(` :::  ${characterItem.property}  - ${characterItem.id}  `);
            }
            this.server.broadcast(MESSAGE.SyncChangedItem, changedItem, { except: client });
        });

        this.server.onMessage(MESSAGE.CheckChangedItem, (client: SandboxPlayer, message: string) => {
            if (false == this.ChangedItems.has(message)) {
                return;
            }
            const changedItem: ChangedItem = {
                sessionId: client.sessionId,
                characterItems: []
            };

            const values = this.ChangedItems.get(message);
            if (values !== null && values !== undefined) {
                for (const property of values.keys()) {
                    const id = values.get(property);
                    if (id === null || id === undefined) continue;

                    const characterItem: CharacterItem = {
                        property,
                        id
                    };
                    changedItem.characterItems.push(characterItem);
                }
            }
            client.send(MESSAGE.SyncChangedItem, changedItem);
        });
    }

    async OnJoin(client: SandboxPlayer) {
    }

    async OnLeave(client: SandboxPlayer) {
    }

    OnTick(deltaTime: number) {
    }

}

interface CharacterItem {
    id: string;
    property: string;
}

interface ChangedItem {
    sessionId: string;
    characterItems: CharacterItem[];
}

enum Cloth {
    TOP = "19",
    BOTTOM = "20",
    DRESS = "22"
}

enum MESSAGE {
    OnChangedItem = "OnChangedItem",
    SyncChangedItem = "SyncChangedItem",
    CheckChangedItem = "CheckChangedItem"
}
