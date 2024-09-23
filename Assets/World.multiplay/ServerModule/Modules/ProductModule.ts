/* version info 1.0.0 */
/* release 2022.03.03 */
import {SandboxPlayer} from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {loadCurrency} from "ZEPETO.Multiplay.Currency";
import {loadInventory} from "ZEPETO.Multiplay.Inventory";
import {DataStorage, loadDataStorage} from 'ZEPETO.Multiplay.DataStorage'

export default class ProductModule extends IModule {
    storageMap: Map<string, DataStorage> = new Map<string, DataStorage>();

    async OnCreate() {
        this.server.onMessage("onCredit", (client: SandboxPlayer, message:CurrencyMessage) => {

            console.log(`[onCredit]`);
            const currencyId = message.currencyId;
            const quantity = message.quantity ?? 1;

            this.AddCredit(client, currencyId, quantity);
        });

        this.server.onMessage("onDebit", (client: SandboxPlayer, message:CurrencyMessage) => {

            console.log(`[onDebit]`);
            const currencyId = message.currencyId;
            const quantity = message.quantity ?? 1;

            this.OnDebit(client, currencyId, quantity);
        });


        this.server.onMessage("onAddInventory", (client: SandboxPlayer, message:InventoryMessage) => {

            console.log(`[onAddInventory]`);
            const productId = message.productId;
            const quantity = message.quantity ?? 1;

            this.AddInventory(client, productId, quantity);
        });


        this.server.onMessage("onUseInventory", (client: SandboxPlayer, message:InventoryMessage) => {

            console.log(`[onUseInventory]`);
            const productId = message.productId;
            const quantity = message.quantity ?? 1;

            this.UseInventory(client, productId, quantity);
        });

        this.server.onMessage("onRemoveInventory", (client: SandboxPlayer, message:InventoryMessage) => {

            console.log(`[onRemoveInventory]`);
            const productId = message.productId;

            this.RemoveInventory(client, productId);
        });


        // DataStorage
        this.server.onMessage("onSetStorage", (client: SandboxPlayer, message:StorageMessage) => {

            console.log(`[onSetStorage]`);
            const key = message.key;
            const value = message.value ?? "";
            this.SetStorage(client, key, value);
        });

        this.server.onMessage("onGetStorage", (client: SandboxPlayer, message:StorageMessage) => {

            const key = message.key;
            console.log(`[onGetStorage] ${key}`);

            this.GetStorage(client, key);
        });

    }

    async SetStorage(client: SandboxPlayer, key: string, value: string) {

        try {
            const dataStorage = await loadDataStorage(client.userId);
            const result = await dataStorage.set(key, value);
            client.send("onSetStorageResult", result);
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }



    async GetStorage(client: SandboxPlayer, key: string) {

        try {
            const dataStorage = await loadDataStorage(client.userId);
            const result = await dataStorage.get(key) as string;

            if (result === undefined) {
                // it is an empty string
                client.send("onGetStorageResult", "");
            } else
            {
                client.send("onGetStorageResult", result);
            }

        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }


    async AddInventory(client: SandboxPlayer, productId: string, quantity: number) {

        try {
            const inventory = await loadInventory(client.userId);
            await inventory.add(productId, quantity);
            const inventorySync: InventorySync = {
                productId : productId,
                inventoryAction : InventoryAction.Add
            }
            client.send("SyncInventories",inventorySync);
            console.log("success add");

        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }


    async UseInventory(client: SandboxPlayer, productId: string, quantity: number) {

        try {
            const inventory = await loadInventory(client.userId);
            if (await inventory.use(productId, quantity) === true) {
                const inventorySync: InventorySync = {
                    productId: productId,
                    inventoryAction: InventoryAction.Use
                }
                client.send("SyncInventories", inventorySync);
                console.log("success use");

            }
            else{
                console.log("use error");
            }
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }


    async RemoveInventory(client: SandboxPlayer, productId: string) {

        try {
            const inventory = await loadInventory(client.userId);
            if (await inventory.remove(productId) === true) {
                const inventorySync: InventorySync = {
                    productId: productId,
                    inventoryAction: InventoryAction.Remove
                }
                client.send("SyncInventories", inventorySync);
                console.log("success rm");
            }
            else{
                console.log("remove error");
            }
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }



    async AddCredit(client: SandboxPlayer, currencyId: string, quantity: number) {

        try {
            const currency = await loadCurrency(client.userId);
            await currency.credit(currencyId, quantity);
            const currencySync: CurrencyMessage = {
                currencyId : currencyId,
                quantity : quantity
            }
            client.send("SyncBalances",currencySync);
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }

    async OnDebit(client: SandboxPlayer, currencyId: string, quantity: number) {

        try {
            const currency = await loadCurrency(client.userId);
            if(await currency.debit(currencyId, quantity) === true) {
                const currencySync: CurrencyMessage = {
                    currencyId: currencyId,
                    quantity: -quantity
                }
                client.send("SyncBalances", currencySync);
            }
            else{
                //It's usually the case that there's no balance.
                client.send("DebitError", "Currency Not Enough");
            }
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }

    async OnJoin(client: SandboxPlayer) {
    }

    async OnLeave(client: SandboxPlayer) {
    }

    OnTick(deltaTime: number) {
    }

}

interface CurrencyMessage {
    currencyId: string,
    quantity?: number,
}

interface InventoryMessage {
    productId: string,
    quantity?: number,
}

interface StorageMessage {
    key: string,
    value?: string,
}

interface InventorySync {
    productId: string,
    inventoryAction: InventoryAction,
}

export enum InventoryAction{
    Remove = -1,
    Use,
    Add,
}