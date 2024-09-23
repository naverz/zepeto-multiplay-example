declare module "spec" {
    export const SWITCH_TO_STRUCTURE = 255;
    export const TYPE_ID = 213;
    /**
     * Encoding Schema field operations.
     */
    export enum OPERATION {
        ADD = 128,
        REPLACE = 0,
        DELETE = 64,
        DELETE_AND_ADD = 192,
        TOUCH = 1,
        CLEAR = 10
    }
}
declare module "encoding/encode" {
    export function utf8Write(view: any, offset: any, str: any): void;
    export function int8(bytes: any, value: any): void;
    export function uint8(bytes: any, value: any): void;
    export function int16(bytes: any, value: any): void;
    export function uint16(bytes: any, value: any): void;
    export function int32(bytes: any, value: any): void;
    export function uint32(bytes: any, value: any): void;
    export function int64(bytes: any, value: any): void;
    export function uint64(bytes: any, value: any): void;
    export function float32(bytes: any, value: any): void;
    export function float64(bytes: any, value: any): void;
    export function writeFloat32(bytes: any, value: any): void;
    export function writeFloat64(bytes: any, value: any): void;
    export function boolean(bytes: any, value: any): void;
    export function string(bytes: any, value: any): number;
    export function number(bytes: any, value: any): any;
}
declare module "encoding/decode" {
    /**
     * msgpack implementation highly based on notepack.io
     * https://github.com/darrachequesne/notepack
     */
    export interface Iterator {
        offset: number;
    }
    export function int8(bytes: number[], it: Iterator): number;
    export function uint8(bytes: number[], it: Iterator): number;
    export function int16(bytes: number[], it: Iterator): number;
    export function uint16(bytes: number[], it: Iterator): number;
    export function int32(bytes: number[], it: Iterator): number;
    export function uint32(bytes: number[], it: Iterator): number;
    export function float32(bytes: number[], it: Iterator): number;
    export function float64(bytes: number[], it: Iterator): number;
    export function int64(bytes: number[], it: Iterator): number;
    export function uint64(bytes: number[], it: Iterator): number;
    export function readFloat32(bytes: number[], it: Iterator): number;
    export function readFloat64(bytes: number[], it: Iterator): number;
    export function boolean(bytes: number[], it: Iterator): boolean;
    export function string(bytes: any, it: Iterator): string;
    export function stringCheck(bytes: any, it: Iterator): boolean;
    export function number(bytes: any, it: Iterator): any;
    export function numberCheck(bytes: any, it: Iterator): boolean;
    export function arrayCheck(bytes: any, it: Iterator): boolean;
    export function switchStructureCheck(bytes: any, it: Iterator): boolean;
}
declare module "types/ArraySchema" {
    import { SchemaDecoderCallbacks } from "Schema";
    import { ChangeTree } from "changes/ChangeTree";
    export function getArrayProxy(value: ArraySchema): ArraySchema<any>;
    export class ArraySchema<V = any> implements Array<V>, SchemaDecoderCallbacks {
        protected $changes: ChangeTree;
        protected $items: Map<number, V>;
        protected $indexes: Map<number, number>;
        protected $refId: number;
        [n: number]: V;
        onAdd?: (item: V, key: number) => void;
        onRemove?: (item: V, key: number) => void;
        onChange?: (item: V, key: number) => void;
        static is(type: any): boolean;
        constructor(...items: V[]);
        set length(value: number);
        get length(): number;
        push(...values: V[]): number;
        /**
         * Removes the last element from an array and returns it.
         */
        pop(): V | undefined;
        at(index: number): V;
        setAt(index: number, value: V): void;
        deleteAt(index: number): boolean;
        protected $deleteAt(index: any): boolean;
        clear(isDecoding?: boolean): void;
        /**
         * Combines two or more arrays.
         * @param items Additional items to add to the end of array1.
         */
        concat(...items: (V | ConcatArray<V>)[]): ArraySchema<V>;
        /**
         * Adds all the elements of an array separated by the specified separator string.
         * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
         */
        join(separator?: string): string;
        /**
         * Reverses the elements in an Array.
         */
        reverse(): ArraySchema<V>;
        /**
         * Removes the first element from an array and returns it.
         */
        shift(): V | undefined;
        /**
         * Returns a section of an array.
         * @param start The beginning of the specified portion of the array.
         * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
         */
        slice(start?: number, end?: number): V[];
        /**
         * Sorts an array.
         * @param compareFn Function used to determine the order of the elements. It is expected to return
         * a negative value if first argument is less than second argument, zero if they're equal and a positive
         * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
         * ```ts
         * [11,2,22,1].sort((a, b) => a - b)
         * ```
         */
        sort(compareFn?: (a: V, b: V) => number): this;
        /**
         * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
         * @param start The zero-based location in the array from which to start removing elements.
         * @param deleteCount The number of elements to remove.
         * @param items Elements to insert into the array in place of the deleted elements.
         */
        splice(start: number, deleteCount?: number, ...items: V[]): V[];
        /**
         * Inserts new elements at the start of an array.
         * @param items  Elements to insert at the start of the Array.
         */
        unshift(...items: V[]): number;
        /**
         * Returns the index of the first occurrence of a value in an array.
         * @param searchElement The value to locate in the array.
         * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
         */
        indexOf(searchElement: V, fromIndex?: number): number;
        /**
         * Returns the index of the last occurrence of a specified value in an array.
         * @param searchElement The value to locate in the array.
         * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
         */
        lastIndexOf(searchElement: V, fromIndex?: number): number;
        /**
         * Determines whether all the members of an array satisfy the specified test.
         * @param callbackfn A function that accepts up to three arguments. The every method calls
         * the callbackfn function for each element in the array until the callbackfn returns a value
         * which is coercible to the Boolean value false, or until the end of the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function.
         * If thisArg is omitted, undefined is used as the this value.
         */
        every(callbackfn: (value: V, index: number, array: V[]) => unknown, thisArg?: any): boolean;
        /**
         * Determines whether the specified callback function returns true for any element of an array.
         * @param callbackfn A function that accepts up to three arguments. The some method calls
         * the callbackfn function for each element in the array until the callbackfn returns a value
         * which is coercible to the Boolean value true, or until the end of the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function.
         * If thisArg is omitted, undefined is used as the this value.
         */
        some(callbackfn: (value: V, index: number, array: V[]) => unknown, thisArg?: any): boolean;
        /**
         * Performs the specified action for each element in an array.
         * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
         * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        forEach(callbackfn: (value: V, index: number, array: V[]) => void, thisArg?: any): void;
        /**
         * Calls a defined callback function on each element of an array, and returns an array that contains the results.
         * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        map<U>(callbackfn: (value: V, index: number, array: V[]) => U, thisArg?: any): U[];
        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        filter(callbackfn: (value: V, index: number, array: V[]) => unknown, thisArg?: any): any;
        /**
         * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
         * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
         * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
         */
        reduce<U = V>(callbackfn: (previousValue: U, currentValue: V, currentIndex: number, array: V[]) => U, initialValue?: U): U;
        /**
         * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
         * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
         * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
         */
        reduceRight<U = V>(callbackfn: (previousValue: U, currentValue: V, currentIndex: number, array: V[]) => U, initialValue?: U): U;
        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find(predicate: (value: V, index: number, obj: V[]) => boolean, thisArg?: any): V | undefined;
        /**
         * Returns the index of the first element in the array where predicate is true, and -1
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found,
         * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        findIndex(predicate: (value: V, index: number, obj: V[]) => unknown, thisArg?: any): number;
        /**
         * Returns the this object after filling the section identified by start and end with value
         * @param value value to fill array section with
         * @param start index to start filling the array at. If start is negative, it is treated as
         * length+start where length is the length of the array.
         * @param end index to stop filling the array at. If end is negative, it is treated as
         * length+end.
         */
        fill(value: V, start?: number, end?: number): this;
        /**
         * Returns the this object after copying a section of the array identified by start and end
         * to the same array starting at position target
         * @param target If target is negative, it is treated as length+target where length is the
         * length of the array.
         * @param start If start is negative, it is treated as length+start. If end is negative, it
         * is treated as length+end.
         * @param end If not specified, length of the this object is used as its default value.
         */
        copyWithin(target: number, start: number, end?: number): this;
        /**
         * Returns a string representation of an array.
         */
        toString(): string;
        /**
         * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
         */
        toLocaleString(): string;
        /** Iterator */
        [Symbol.iterator](): IterableIterator<V>;
        [Symbol.unscopables](): any;
        /**
         * Returns an iterable of key, value pairs for every entry in the array
         */
        entries(): IterableIterator<[number, V]>;
        /**
         * Returns an iterable of keys in the array
         */
        keys(): IterableIterator<number>;
        /**
         * Returns an iterable of values in the array
         */
        values(): IterableIterator<V>;
        /**
         * Determines whether an array includes a certain element, returning true or false as appropriate.
         * @param searchElement The element to search for.
         * @param fromIndex The position in this array at which to begin searching for searchElement.
         */
        includes(searchElement: V, fromIndex?: number): boolean;
        /**
         * Calls a defined callback function on each element of an array. Then, flattens the result into
         * a new array.
         * This is identical to a map followed by flat with depth 1.
         *
         * @param callback A function that accepts up to three arguments. The flatMap method calls the
         * callback function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callback function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        flatMap<U, This = undefined>(callback: (this: This, value: V, index: number, array: V[]) => U | ReadonlyArray<U>, thisArg?: This): U[];
        /**
         * Returns a new array with all sub-array elements concatenated into it recursively up to the
         * specified depth.
         *
         * @param depth The maximum recursion depth
         */
        flat<A, D extends number = 1>(this: A, depth?: D): any;
        protected setIndex(index: number, key: number): void;
        protected getIndex(index: number): number;
        protected getByIndex(index: number): V;
        protected deleteByIndex(index: number): void;
        toArray(): V[];
        toJSON(): any[];
        clone(isDecoding?: boolean): ArraySchema<V>;
        triggerAll(): void;
    }
}
declare module "types/MapSchema" {
    import { SchemaDecoderCallbacks } from "Schema";
    import { ChangeTree } from "changes/ChangeTree";
    export function getMapProxy(value: MapSchema): MapSchema<any>;
    export class MapSchema<V = any> implements Map<string, V>, SchemaDecoderCallbacks {
        protected $changes: ChangeTree;
        protected $items: Map<string, V>;
        protected $indexes: Map<number, string>;
        protected $refId: number;
        onAdd?: (item: V, key: string) => void;
        onRemove?: (item: V, key: string) => void;
        onChange?: (item: V, key: string) => void;
        static is(type: any): boolean;
        constructor(initialValues?: Map<string, V> | any);
        /** Iterator */
        [Symbol.iterator](): IterableIterator<[string, V]>;
        get [Symbol.toStringTag](): string;
        set(key: string, value: V): this;
        get(key: string): V | undefined;
        delete(key: string): boolean;
        clear(isDecoding?: boolean): void;
        has(key: string): boolean;
        forEach(callbackfn: (value: V, key: string, map: Map<string, V>) => void): void;
        entries(): IterableIterator<[string, V]>;
        keys(): IterableIterator<string>;
        values(): IterableIterator<V>;
        get size(): number;
        protected setIndex(index: number, key: string): void;
        protected getIndex(index: number): string;
        protected getByIndex(index: number): V;
        protected deleteByIndex(index: number): void;
        toJSON(): any;
        clone(isDecoding?: boolean): MapSchema<V>;
        triggerAll(): void;
    }
}
declare module "types/CollectionSchema" {
    import { SchemaDecoderCallbacks } from "Schema";
    import { ChangeTree } from "changes/ChangeTree";
    type K = number;
    export class CollectionSchema<V = any> implements SchemaDecoderCallbacks {
        protected $changes: ChangeTree;
        protected $items: Map<number, V>;
        protected $indexes: Map<number, number>;
        protected $refId: number;
        onAdd?: (item: V, key: number) => void;
        onRemove?: (item: V, key: number) => void;
        onChange?: (item: V, key: number) => void;
        static is(type: any): boolean;
        constructor(initialValues?: Array<V>);
        add(value: V): number;
        at(index: number): V | undefined;
        entries(): IterableIterator<[number, V]>;
        delete(item: V): boolean;
        clear(isDecoding?: boolean): void;
        has(value: V): boolean;
        forEach(callbackfn: (value: V, key: K, collection: CollectionSchema<V>) => void): void;
        values(): IterableIterator<V>;
        get size(): number;
        protected setIndex(index: number, key: number): void;
        protected getIndex(index: number): number;
        protected getByIndex(index: number): V;
        protected deleteByIndex(index: number): void;
        toArray(): V[];
        toJSON(): V[];
        clone(isDecoding?: boolean): CollectionSchema<V>;
        triggerAll(): void;
    }
}
declare module "types/SetSchema" {
    import { SchemaDecoderCallbacks } from "Schema";
    import { ChangeTree } from "changes/ChangeTree";
    export class SetSchema<V = any> implements SchemaDecoderCallbacks {
        protected $changes: ChangeTree;
        protected $items: Map<number, V>;
        protected $indexes: Map<number, number>;
        protected $refId: number;
        onAdd?: (item: V, key: number) => void;
        onRemove?: (item: V, key: number) => void;
        onChange?: (item: V, key: number) => void;
        static is(type: any): boolean;
        constructor(initialValues?: Array<V>);
        add(value: V): number | false;
        entries(): IterableIterator<[number, V]>;
        delete(item: V): boolean;
        clear(isDecoding?: boolean): void;
        has(value: V): boolean;
        forEach(callbackfn: (value: V, key: number, collection: SetSchema<V>) => void): void;
        values(): IterableIterator<V>;
        get size(): number;
        protected setIndex(index: number, key: number): void;
        protected getIndex(index: number): number;
        protected getByIndex(index: number): V;
        protected deleteByIndex(index: number): void;
        toArray(): V[];
        toJSON(): V[];
        clone(isDecoding?: boolean): SetSchema<V>;
        triggerAll(): void;
    }
}
declare module "types/HelperTypes" {
    type Bool = 'true' | 'false';
    type Key = string | number | symbol;
    type Not<X extends Bool> = {
        true: 'false';
        false: 'true';
    }[X];
    type HaveIntersection<S1 extends string, S2 extends string> = ({
        [K in S1]: 'true';
    } & {
        [key: string]: 'false';
    })[S2];
    type IsNeverWorker<S extends Key> = ({
        [K in S]: 'false';
    } & {
        [key: string]: 'true';
    })[S];
    type IsNever<T extends Key> = Not<HaveIntersection<IsNeverWorker<T>, 'false'>>;
    type IsFunction<T> = IsNever<keyof T>;
    export type NonFunctionProps<T> = {
        [K in keyof T]: {
            'false': K;
            'true': never;
        }[IsFunction<T[K]>];
    }[keyof T];
    export type NonFunctionPropNames<T> = {
        [K in keyof T]: T[K] extends Function ? never : K;
    }[keyof T];
}
declare module "events/EventEmitter" {
    /**
     * Extracted from https://www.npmjs.com/package/strong-events
     */
    type ExtractFunctionParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
    export class EventEmitter_<CallbackSignature extends (...args: any[]) => any> {
        handlers: Array<CallbackSignature>;
        register(cb: CallbackSignature, once?: boolean): this;
        invoke(...args: ExtractFunctionParameters<CallbackSignature>): void;
        invokeAsync(...args: ExtractFunctionParameters<CallbackSignature>): Promise<any[]>;
        remove(cb: CallbackSignature): void;
        clear(): void;
    }
}
declare module "filters/index" {
    import { ClientWithSessionId } from "annotations";
    import { ChangeTree } from "changes/ChangeTree";
    export class ClientState {
        refIds: WeakSet<ChangeTree>;
        containerIndexes: WeakMap<ChangeTree, Set<number>>;
        addRefId(changeTree: ChangeTree): void;
        static get(client: ClientWithSessionId): ClientState;
    }
}
declare module "types/index" {
    export interface TypeDefinition {
        constructor: any;
        getProxy?: any;
    }
    export function registerType(identifier: string, definition: TypeDefinition): void;
    export function getType(identifier: string): TypeDefinition;
}
declare module "Schema" {
    import { ClientWithSessionId, Context, DefinitionType, SchemaDefinition } from "annotations";
    import { ChangeTree, Ref } from "changes/ChangeTree";
    import type { Iterator } from "encoding/decode";
    import { EventEmitter_ } from "events/EventEmitter";
    import { OPERATION } from "spec";
    import { NonFunctionPropNames } from "types/HelperTypes";
    export interface DataChange<T = any> {
        op: OPERATION;
        field: string;
        dynamicIndex?: number | string;
        value: T;
        previousValue: T;
    }
    export interface SchemaDecoderCallbacks {
        onAdd?: (item: any, key: any) => void;
        onRemove?: (item: any, key: any) => void;
        onChange?: (item: any, key: any) => void;
        clone(decoding?: boolean): SchemaDecoderCallbacks;
        clear(decoding?: boolean): any;
        decode?(byte: any, it: Iterator): any;
    }
    /**
     * Schema encoder / decoder
     */
    export abstract class Schema {
        static _typeid: number;
        static _context: Context;
        static _definition: SchemaDefinition;
        static onError(e: any): void;
        static is(type: DefinitionType): boolean;
        protected $changes: ChangeTree;
        protected $listeners: {
            [field: string]: EventEmitter_<(a: any, b: any) => void>;
        };
        onChange?(changes: DataChange[]): any;
        onRemove?(): any;
        constructor(...args: any[]);
        assign(props: {
            [prop in NonFunctionPropNames<this>]?: this[prop];
        }): this;
        protected get _definition(): SchemaDefinition;
        listen<K extends NonFunctionPropNames<this>>(attr: K, callback: (value: this[K], previousValue: this[K]) => void): () => void;
        decode(bytes: number[], it?: Iterator, ref?: Ref, allChanges?: Map<number, DataChange[]>): Map<number, DataChange<any>[]>;
        encode(encodeAll?: boolean, bytes?: number[], useFilters?: boolean): number[];
        encodeAll(useFilters?: boolean): number[];
        applyFilters(client: ClientWithSessionId, encodeAll?: boolean): number[];
        clone(): this;
        triggerAll(): void;
        toJSON(): {};
        discardAllChanges(): void;
        protected getByIndex(index: number): any;
        protected deleteByIndex(index: number): void;
        private tryEncodeTypeId;
        private getSchemaType;
        private createTypeInstance;
        private _triggerAllFillChanges;
        private _triggerChanges;
    }
}
declare module "changes/ChangeTree" {
    import { Schema } from "Schema";
    import { FilterChildrenCallback } from "annotations";
    import { OPERATION } from "spec";
    import { ArraySchema } from "types/ArraySchema";
    import { CollectionSchema } from "types/CollectionSchema";
    import { MapSchema } from "types/MapSchema";
    import { SetSchema } from "types/SetSchema";
    export type Ref = Schema | ArraySchema | MapSchema | CollectionSchema | SetSchema;
    export interface ChangeOperation {
        op: OPERATION;
        index: number;
    }
    export interface FieldCache {
        beginIndex: number;
        endIndex: number;
    }
    export class Root {
        refs: Map<number, Ref>;
        refCounts: {
            [refId: number]: number;
        };
        deletedRefs: Set<number>;
        protected nextUniqueId: number;
        getNextUniqueId(): number;
        addRef(refId: number, ref: Ref, incrementCount?: boolean): void;
        removeRef(refId: any): void;
        clearRefs(): void;
        garbageCollectDeletedRefs(): void;
    }
    export class ChangeTree {
        ref: Ref;
        refId: number;
        root?: Root;
        parent?: Ref;
        parentIndex?: number;
        indexes: {
            [index: string]: any;
        };
        changed: boolean;
        changes: Map<number, ChangeOperation>;
        allChanges: Set<number>;
        caches: {
            [field: number]: number[];
        };
        currentCustomOperation: number;
        constructor(ref: Ref, parent?: Ref, root?: Root);
        setParent(parent: Ref, root?: Root, parentIndex?: number): void;
        operation(op: ChangeOperation): void;
        change(fieldName: string | number, operation?: OPERATION): void;
        touch(fieldName: string | number): void;
        touchParents(): void;
        getType(index?: number): any;
        getChildrenFilter(): FilterChildrenCallback;
        getValue(index: number): any;
        delete(fieldName: string | number): void;
        discard(changed?: boolean, discardAll?: boolean): void;
        /**
         * Recursively discard all changes from this, and child structures.
         */
        discardAll(): void;
        cache(field: number, cachedBytes: number[]): void;
        clone(): ChangeTree;
        ensureRefId(): void;
        protected assertValidIndex(index: number, fieldName: string | number): void;
    }
}
declare module "annotations" {
    import { Schema } from "Schema";
    /**
     * Data types
     */
    export type PrimitiveType = "string" | "number" | "boolean" | "int8" | "uint8" | "int16" | "uint16" | "int32" | "uint32" | "int64" | "uint64" | "float32" | "float64" | typeof Schema;
    export type DefinitionType = PrimitiveType | PrimitiveType[] | {
        array: PrimitiveType;
    } | {
        map: PrimitiveType;
    } | {
        collection: PrimitiveType;
    } | {
        set: PrimitiveType;
    };
    export type Definition = {
        [field: string]: DefinitionType;
    };
    export type FilterCallback<T extends Schema = any, V = any, R extends Schema = any> = (((this: T, client: ClientWithSessionId, value: V) => boolean) | ((this: T, client: ClientWithSessionId, value: V, root: R) => boolean));
    export type FilterChildrenCallback<T extends Schema = any, K = any, V = any, R extends Schema = any> = (((this: T, client: ClientWithSessionId, key: K, value: V) => boolean) | ((this: T, client: ClientWithSessionId, key: K, value: V, root: R) => boolean));
    export class SchemaDefinition {
        schema: Definition;
        indexes: {
            [field: string]: number;
        };
        fieldsByIndex: {
            [index: number]: string;
        };
        filters: {
            [field: string]: FilterCallback;
        };
        indexesWithFilters: number[];
        childFilters: {
            [field: string]: FilterChildrenCallback;
        };
        deprecated: {
            [field: string]: boolean;
        };
        descriptors: PropertyDescriptorMap & ThisType<any>;
        static create(parent?: SchemaDefinition): SchemaDefinition;
        addField(field: string, type: DefinitionType): void;
        addFilter(field: string, cb: FilterCallback): boolean;
        addChildrenFilter(field: string, cb: FilterChildrenCallback): boolean;
        getChildrenFilter(field: string): FilterChildrenCallback<any, any, any, any>;
        getNextFieldIndex(): number;
    }
    export function hasFilter(klass: typeof Schema): boolean;
    export type ClientWithSessionId = {
        sessionId: string;
    } & any;
    export class Context {
        types: {
            [id: number]: typeof Schema;
        };
        schemas: Map<typeof Schema, number>;
        useFilters: boolean;
        has(schema: typeof Schema): boolean;
        get(typeid: number): typeof Schema;
        add(schema: typeof Schema, typeid?: number): void;
        static create(context?: Context): (definition: DefinitionType) => PropertyDecorator;
    }
    export const globalContext: Context;
    /**
     * `@type()` decorator for proxies
     */
    export function type(type: DefinitionType, context?: Context): PropertyDecorator;
    /**
     * `@filter()` decorator for defining data filters per client
     */
    export function filter<T extends Schema, V, R extends Schema>(cb: FilterCallback<T, V, R>): PropertyDecorator;
    export function filterChildren<T extends Schema, K, V, R extends Schema>(cb: FilterChildrenCallback<T, K, V, R>): PropertyDecorator;
    /**
     * `@deprecated()` flag a field as deprecated.
     * The previous `@type()` annotation should remain along with this one.
     */
    export function deprecated(throws?: boolean, context?: Context): PropertyDecorator;
    export function defineTypes(target: typeof Schema, fields: {
        [property: string]: DefinitionType;
    }, context?: Context): typeof Schema;
}
declare module "Reflection" {
    import { Schema } from "Schema";
    import { Iterator } from "encoding/decode";
    import { ArraySchema } from "types/ArraySchema";
    /**
     * Reflection
     */
    export class ReflectionField extends Schema {
        name: string;
        type: string;
        referencedType: number;
    }
    export class ReflectionType extends Schema {
        id: number;
        fields: ArraySchema<ReflectionField>;
    }
    export class Reflection extends Schema {
        types: ArraySchema<ReflectionType>;
        rootType: number;
        static encode(instance: Schema): number[];
        static decode<T extends Schema = Schema>(bytes: number[], it?: Iterator): T;
    }
}
declare module "utils" {
    import { Schema } from "@colyseus/schema";
    export function dumpChanges(schema: Schema): {};
}
declare module "@colyseus/schema" {
    export { Reflection, ReflectionField, ReflectionType } from "Reflection";
    export { DataChange, Schema } from "Schema";
    export { Context, Definition, DefinitionType, FilterCallback, PrimitiveType, SchemaDefinition, defineTypes, deprecated, filter, filterChildren, hasFilter, type } from "annotations";
    export { Iterator } from "encoding/decode";
    export { OPERATION } from "spec";
    export { dumpChanges } from "utils";
    export { ArraySchema, CollectionSchema, MapSchema, SetSchema, decode, encode, registerType };
    import * as decode from "encoding/decode";
    import * as encode from "encoding/encode";
    import { ArraySchema } from "types/ArraySchema";
    import { CollectionSchema } from "types/CollectionSchema";
    import { MapSchema } from "types/MapSchema";
    import { SetSchema } from "types/SetSchema";
    import { registerType } from "types/index";
}


declare module "ZEPETO.Multiplay" {

    import { State } from 'ZEPETO.Multiplay.Schema';

    interface SystemError {
        code: string,
        message: string
    }

    /**
     * Represents a player's client connected to the Multiplay Room.
     */
    interface SandboxPlayer {
        /**
         * Client's session ID
         */
        readonly sessionId: string;
        /**
         * Player's user ID
         */
        readonly userId: string;

        /**
         * Sends a message through a specified channel to a client.
         * @typeParam T Optionally specifies the type of `message`.
         * @param type The identifier of the channel to send the message through.
         * @param message message Optional content of the message to be sent.
         */
        send<T>(type: string | number, message?: T): void;
    }

    /**
     * Options for broadcasting messages from the Multiplay Room to clients.
     */
    interface IBroadcastOptions {
        /**
         * Specifies a client to be excluded from the broadcast.
         */
        except?: SandboxPlayer;
    }

    /**
     * Options for creating a Multiplay Room.
     */
    interface SandboxOptions {
        /**
         * Specifies whether the Room is hosted locally, such as for QR Mobile testing in the Unity editor.
         */
        readonly isSandbox: boolean;

        readonly matchMakingValue: { [key: string]: any };
    }

    /**
     * Represents a Multiplay Room.
     */
    abstract class Sandbox {
        /**
         * Specifies whether the Multiplay Room is locked.
         */
        readonly locked: boolean;
        /**
         * ID of the Multiplay Room, assigned randomly upon creation to avoid duplication.
         */
        readonly roomId: string;
        /**
         * ID of the Multiplay Room, explicitly assigned upon creation.
         */
        readonly uniqueId?: string;
        /**
         * Maximum number of clients able to connect to the Multiplay Room.
         */
        readonly maxClients: number;
        /**
         * State of a Multiplay Room. The schema for the state data is defined by the Multiplay Schema.
         */
        readonly state: State;
        /**
         * Iterable representation of the clients connected to the Multiplay Room.
         */
        readonly clients: IterableIterator<SandboxPlayer>;
        /**
         * Time limit (in seconds) for allowing the reconnection of a client with an unstable connection.
         */
        readonly allowReconnectionTime: number;
        /**
         * Specifies whether the Multiplay Room is private.
         */
        readonly private: boolean;
        /**
         * Implementation of this abstract method is run once, when the Multiplay Room is created.
         * Implementation can be optionally declared `async`.
         * @param options Options for creating the Multiplay Room.
         * @returns If asynchronous, it returns `Promise<void>`. Otherwise, `void`.
         */
        abstract onCreate?(options: SandboxOptions): void | Promise<void>;
        /**
         * Implementation of this abstract method is run when a client joins the Multiplay Room.
         * Implementation can be optionally declared `async`.
         * @param client Client object of the player.
         * @returns If asynchronous, it returns `Promise<void>`. Otherwise, `void`.
         */
        abstract onJoin?(client: SandboxPlayer): void | Promise<void>;
        /**
         * Implementation of this abstract method is run when a client leaves the Multiplay Room.
         * Implementation can be optionally declared `async`.
         * @param client Client object of the player.
         * @param consented Specifies whether the player has consented to reconnect.
         * @returns If asynchronous, it returns `Promise<void>`. Otherwise, `void`.
         */
        abstract onLeave?(client: SandboxPlayer, consented?: boolean): void | Promise<void>;
        /**
         * Locks the Multiplay Room.
         * @returns `Promise` resolved upon completion of the locking process.
         */
        lock(): Promise<void>;
        /**
         * Unlocks the Multiplay Room.
         * @returns `Promise` resolved upon completion of the unlocking process.
         */
        unlock(): Promise<void>;
        /**
         * Implementation of this method is executed approximately every 100 milliseconds.
         * @param deltaTime Represents the time difference (in milliseconds) from the previous call.
         */
        onTick?(deltaTime: number): void;
        /**
         * Registers a callback to handle messages received from clients.
         * @typeParam T Optionally specifies the type of `message` in the `callback`.
         * @param messageType The identifier of the channel the message was sent through.
         * @param callback Callback method to handle the received message.
         */
        onMessage<T = any>(messageType: '*' | string | number, callback: (client: SandboxPlayer, message: T) => void): void;
        /**
         * Sends a message through a specified channel to every client connected to the Multiplay Room.
         * @param type The identifier of the channel to send the message through.
         * @param message Optional content of the message.
         * @param options Broadcast options.
         */
        broadcast(type: string | number, message?: any, options?: IBroadcastOptions): void;
        /**
         * Gets the client object associated with a session ID.
         * @param sessionId Client's session ID.
         * @returns The client object.
         */
        loadPlayer(sessionId: string): SandboxPlayer | undefined;
        /**
         * Sets the private status of the Multiplay Room.
         * @param isPrivate Specifies the private status of the Multiplay Room.
         * @returns `Promise` resolved upon completion of the process.
         */
        setPrivate(isPrivate: boolean): Promise<void>;
        /**
         * Kicks out a client from the Multiplay Room.
         * @param client Object of the client to be kicked out.
         * @param reason Optionally describe the reason for the kick-out.
         * @returns `Promise` resolved upon completion of the process.
         */
        kick(client: SandboxPlayer, reason?: string): Promise<void>;
    }
}

declare module "ZEPETO.Multiplay.Currency" {
    /**
     * The error code specifies the reason for the failure of in-World currency-related requests.
     */
    const enum CurrencyError {
        /**
         * Error: Unknown error.
         */
        Unknown = -1,
        /**
         * Error: Errors related to network issues, including disconnections or unstable connections.
         */
        NetworkError = 0
    }
    import { SandboxPlayer } from "ZEPETO.Multiplay";
    /**
     * {@link Currency} manages operations associated with ZEPETO World currencies.
     */
    interface Currency {
        /**
         * Deducts the specified amount from the player's in-World currency balance. Throws {@link CurrencyError}.
         * @param id ID of the currency to deduct.
         * @param quantity The quantity of the currency to deduct. Defaults to `1`.
         * @param reason Optionally describes the reason for deduction.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        debit(id: string, quantity?: number, reason?: string): Promise<boolean>;
        /**
         * Increases the specified amount to the player's in-World currency balance. Throws {@link CurrencyError}.
         * @param id ID of the currency to increase.
         * @param quantity The quantity of the currency to increase. Defaults to `1`.
         * @param reason Optionally describes the reason for increase.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        credit(id: string, quantity?: number, reason?: string): Promise<boolean>;
        /**
         * Retrieves the balance of the player's in-World currency. Throws {@link CurrencyError}.
         * @param id ID of the currency to retrieve.
         * @returns `Promise` resolved upon completion, with the retrieved balance amount.
         */
        getBalance(id: string): Promise<number>;
        /**
         * Retrieves the balances of each in-World currency the player has. Throws {@link CurrencyError}.
         * @returns `Promise` resolved upon completion, with the object where each in-World currency ID is a key, and its corresponding balance is the associated value.
         */
        getBalances(): Promise<{
            [key: string]: number
        }>;
    }
    /**
     * Retrieves the currency object associated with a specific player. Throws {@link CurrencyError}.
     * @param userId The user ID of the player.
     * @returns `Promise` resolved upon completion, with the retrieved {@link Currency} object.
     */
    function loadCurrency(userId: string): Promise<Currency>;
    /**
     * Retrieves the currency object associated with a specific player. Throws {@link CurrencyError}.
     * @param client Client object of the player.
     * @returns `Promise` resolved upon completion, with the retrieved {@link Currency} object.
     */
    function loadCurrency(player: SandboxPlayer): Promise<Currency>;
}

declare module 'ZEPETO.Multiplay.DataStorage' {
    /**
     * The error code specifies the reason for the failure of data storage-related requests.
     */
    const enum DataStorageError {
        /**
         * Error: Unknown error.
         */
        Unknown = -1,
        /**
         * Error: Errors related to network issues, including disconnections or unstable connections.
         */
        NetworkError = 0,
        /**
         * Error: Key error.
         */
        KeyConstraintViolated = 103,
        /**
         * Error: Value error.
         */
        ValueConstraintViolated = 104
    }
    /**
     * Represents a data storage abstraction providing methods to store, retrieve, and remove data.
     * This interface defines asynchronous operations for single and multiple data manipulations.
     */
    interface DataStorage {
        /**
         * Stores a value with a specified key. Throws {@link DataStorageError}.
         * @typeParam T Optionally specifies the type of the data to store.
         * @param key The key for storage.
         * @param value Data to store.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        set<T>(key: string, value: T): Promise<boolean>;
        /**
         * Retrieves a value by its key. Throws {@link DataStorageError}.
         * @typeParam T Optionally specifies the type of the retrieved value.
         * @param key The key to search for.
         * @returns `Promise` resolved upon completion with a value of type `T`.
         */
        get<T>(key: string): Promise<T>;
        /**
         * Removes a value with a specified key. Throws {@link DataStorageError}.
         * @typeParam T Optionally specifies the type of the retrieved value.
         * @param key The key to search for.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        remove(key: string): Promise<boolean>;
        /**
         * Retrieves values by multiple keys. Throws {@link DataStorageError}.
         * @typeParam T Optionally specifies the type of retrieved values.
         * @param keys Array of keys to search for.
         * @returns `Promise` resolved upon completion with a key-value object.
         */
        mget<T>(keys: string[]): Promise<{ [key: string]: T }>;
        /**
         * Stores multiple values with specified keys. Throws {@link DataStorageError}.
         * @typeParam T Optionally specifies the type of data to store.
         * @param keyValueSet Array of key-value objects to store.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        mset<T>(keyValueSet: { key: string; value: T; }[]): Promise<boolean>;
    }
    /**
     * Retrieves the data storage object associated with a specified player.
     * @param userId The user ID of the player.
     * @returns `Promise` resolved upon completion with the `DataStorage` object associated with the specified player.
     */
    function loadDataStorage(userId: string): Promise<DataStorage>;
}

declare module 'ZEPETO.Multiplay' {
    import { DataStorage } from 'ZEPETO.Multiplay.DataStorage';
    interface SandboxPlayer {
        /**
         * Retrieves the data storage object associated with the client's player.
         * @returns `DataStorage` object associated with the client's player.
         */
        loadDataStorage(): DataStorage;
    }
}

declare module "ZEPETO.Multiplay.HttpService" {
    /**
     * Enumeration of constants specifying the HTTP Content-Type.
     */
    const enum HttpContentType {
        /**
         * Represents application/json content type.
         */
        ApplicationJson = 'application/json',
        /**
         * Represents application/xml content type.
         */
        ApplicationXml = 'application/xml',
        /**
         * Represents application/x-www-form-urlencoded content type.
         */
        ApplicationUrlEncoded = 'application/x-www-form-urlencoded',
        /**
         * Represents text/plain content type.
         */
        TextPlain = 'text/plain',
        /**
         * Represents text/xml content type.
         */
        TextXml = 'text/xml'
    }
    /**
     * Type alias for HTTP Body content, which can be either plain text or a key-value object.
     */
    type HttpBodyType = string | { [key: string]: any; };
    /**
     * Type alias for HTTP Headers, representing a key-value object.
     */
    type HttpHeader = { [key: string]: string | number; };
    /**
     * Enumeration of constants specifying reasons for failure in HTTP requests.
     */
    const enum HttpErrorType {
        /**
         * Error: Access denied.
         */
        ERR_ACCESS_DENIED = 'ERR_ACCESS_DENIED',
        /**
         * Error: Length required.
         */
        ERR_LENGTH_REQUIRED = 'ERR_LENGTH_REQUIRED'
    }
    /**
      * Represents an error that occurred during an HTTP request.
     */
    interface HttpError extends Error {
        /**
         * Error message.
         */
        message: string;
        /**
         * Error code defined as a value from {@link HttpErrorType} enum.
         */
        code?: string;
    }
    /**
     * Represents an HTTP Response.
     */
    interface HttpResponse {
        /**
         * The status code of the response. Typically, 200 indicates a successful request.
         */
        readonly statusCode: number;
        /**
         * The status message corresponding to the status code. Typically, "OK" indicates a successful request.
         */
        readonly statusText: string;
        /**
         * The body of the HTTP response, which may vary in format based on the response's Content-Type.
         * It is recommended to use an appropriate parser based on the specific Content-Type received.         
         * */
        readonly response: string;
    }
    /**
     * {@link HttpService} provides an API to establish HTTP connections with external web services and make requests.
     * - Ensure using HTTPS protocol; HTTP is supported only in the development environment.
     * - Requests are limited to ports 80 and 443.
     * - The maximum size for request and response bodies is 16KB.
     * - Keep requests per minute below 500 to avoid potential limitations on the World service due to excessive requests.
     * - Requests will fail if external web services do not respond within 5 seconds.
     * - Ensure that the Content-Type in response headers matches values defined in {@link HttpContentType} enum to prevent request failures.
     * - Due to potential web request failures for various reasons, it's recommended to code defensively.
     */
    interface HttpService {
        /**
         * Asynchronously performs an HTTP GET request. Throws {@link HttpError}.
         * @param url The web address to send the request.
         * @param headers HTTP request headers. (Optional)
         * @returns `Promise` resolved with the {@link HttpResponse} object upon completion.
         */
        getAsync(url: string, headers?: HttpHeader): Promise<HttpResponse>;
        /**
         * Perform HTTP POST requests asynchronously. Throws {@link HttpError}.
         * @param url The web address to send the request.
         * @param body Request body content.
         * @param headers HTTP request headers. (Optional)
         * @returns `Promise` resolved with the {@link HttpResponse} object upon completion.
         */
        postAsync(url: string, body: HttpBodyType, headers?: HttpHeader): Promise<HttpResponse>;
        /**
         * Perform HTTP POST requests asynchronously. Throws {@link HttpError}.
         * When using this signature, if you add 'Content-Type' to headers, it will be overwritten by what is specified in `httpContentType`.
         * @param url The web address to send the request.
         * @param body Request body content.
         * @param headers HTTP request headers. (Optional)
         * @param httpContentType Specifies the request Content-Type header.
         * @returns `Promise` resolved with the {@link HttpResponse} object upon completion.
         */
        postAsync(url: string, body: HttpBodyType, httpContentType: HttpContentType, headers?: HttpHeader): Promise<HttpResponse>;
    }
    const HttpService: HttpService;
}

declare module "ZEPETO.Multiplay.Inventory" {
    import { SandboxPlayer } from "ZEPETO.Multiplay";
    /**
     * The error code specifies the reason for the failure of inventory-related requests.
     */
    const enum InventoryError {
        /**
         * Error: Unknown error.
         */
        Unknown = -1,
        /**
         * Error: Errors related to network issues, including disconnections or unstable connections.
         */
        NetworkError = 0
    }
    /**
     * Inventory product information.
     */
    interface InventoryRecord {
        /**
         * Product ID.
         */
        productId: string;
        /**
         * Quantity of the product.
         */
        quantity: number;
        /**
         * Date and time when the product was added to the inventory.
         */
        createdAt: Date;
        /**
         * Date and time when the product information was last updated.
         */
        updatedAt: Date;
    }
    /**
     * {@link Inventory} manages operations associated with the player's in-World product inventory.
     */
    interface Inventory {
        /**
         * Uses an in-World product from the player's inventory. Throws {@link InventoryError}.
         * @param productId ID of the product to use.
         * @param quantity Quantity of the product to use. Defaults to `1`.
         * @param reason Optionally describes the reason for usage.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        use(productId: string, quantity?: number, reason?: string): Promise<boolean>;
        /**
         * Adds an in-World product to the player's inventory. Throws {@link InventoryError}.
         * @param productId ID of the product to add.
         * @param quantity Quantity of the product to add. Defaults to `1`.
         * @param reason Optionally describes the reason for the addition.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        add(productId: string, quantity?: number, reason?: string): Promise<boolean>;
        /**
         * Adds multiple in-World products to the player's inventory. Throws {@link InventoryError}.
         * @param products Array of products to add.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        madd(products: {
            productId: string;
            quantity: number;
            reason?: string;
        }[]): Promise<boolean>;
        /**
         * Checks the existence of an in-World product in the player's inventory.Throws {@link InventoryError}.
         * @param productId ID of the product to check.
         * @returns `Promise` resolved upon completion, indicating exist (`true`) or non-exist (`false`).
         */
        has(productId: string): Promise<boolean>;
        /**
         * Retrieves an in-World product from the player's inventory. Throws {@link InventoryError}.
         * @param productId ID of the product to retrieve.
         * @returns `Promise` resolved upon completion, with the retrieved {@link InventoryRecord} object.
         */
        get(productId: string): Promise<InventoryRecord | null>;
        /**
         * Removes an in-World product from the player's inventory. Throws {@link InventoryError}.
         * @param productId ID of the product to remove.
         * @returns `Promise` resolved upon completion, indicating success (`true`) or failure (`false`).
         */
        remove(productId: string): Promise<boolean>;
        /**
         * Retrieves all in-World products from the player's inventory. Throws {@link InventoryError}.
         * @returns `Promise` resolved upon completion, with an array of the retrieved {@link InventoryRecord} objects.
         */
        list(): Promise<InventoryRecord[]>;
    }
    /**
     * Retrieves the inventory object associated with a specific player. Throws {@link InventoryError}.
     * @param userId The user ID of the player.
     * @returns `Promise` resolved upon completion, with the retrieved {@link Inventory} object.
     */
    function loadInventory(userId: string): Promise<Inventory>;
    /**
     * Retrieves the inventory object associated with a specific player. Throws {@link InventoryError}.
     * @param client Client object of the player.
     * @returns `Promise` resolved upon completion, with the retrieved {@link Inventory} object.
     */
    function loadInventory(player: SandboxPlayer): Promise<Inventory>;
}

declare module "ZEPETO.Multiplay.Product" {
    /**
     * The error code specifies the reason for the failure of in-World product-related requests.
     */
    const enum ProductError {
        /**
         * Error: Unknown error.
         */
        Unknown = -1,
        /**
         * Error: Errors related to network issues, including disconnections or unstable connections.
         */
        NetworkError = 0
    }
    /**
     * Enum representing the in-World product purchase type.
     */
    const enum PurchaseType {
        /**
         * Consumable in-World product.
         */
        Consumable = 'CONSUMABLE',
        /**
         * Non-consumable in-World product.
         */
        NonConsumable = 'NON_CONSUMABLE'
    }
    /**
     * Enum representing the in-World product status.
     */
    const enum ProductStatus {
        /**
         * Active state.
         */
        Active = 'ACTIVE',
        /**
         * Inactive state.
         */
        InActive = 'INACTIVE',
        /**
         * Forbidden state due to expiration of use.
         */
        Forbidden = 'FORBIDDEN'
    }
    /**
     * Enum representing the in-World product type.
     */
    const enum ProductType {
        /**
         * Single item in-World product.
         */
        Item = 'ITEM',
        /**
         * Item in-World product package, including multiple items.
         */
        ItemPackage = 'ITEM_PACKAGE',
        /**
         * Currency in-World product package, including multiple currencies.
         */
        CurrencyPackage = 'CURRENCY_PACKAGE'
    }
    /**
     * In-World product information.
     */
    interface ProductRecord {
        /**
         * In-World Product ID.
         */
        productId: string;
        /**
         * In-World Product name.
         */
        name: string;
        /**
         * In-World Product price.
         */
        price: number;
        /**
         * {@link PurchaseType} of the in-World product.
         */
        purchaseType: PurchaseType;
        /**
         * {@link ProductStatus} of the in-World product.
         */
        status: ProductStatus;
        /**
         * {@link ProductType} of the in-World product.
         */
        productType: ProductType,
        /**
         * Returns the type of the currency used for purchasing the in-World product.
         */
        currency: {
            /**
             * Currency ID.
             */
            currencyId: string;
            /**
             * Currency name.
             */
            name: string,
            /**
             * Indicates whether the currency is ZEPETO’s official currency (ZEM) or an in-World currency.
             */
            isOfficialCurrency: boolean,
        };
        /**
         * Items included in the in-World product if {@link ProductType} is `ItemPackage`.
         */
        itemPackageUnits?: {
            /**
             * In-World Product ID.
             */
            productId: string;
            /**
             * Item name.
             */
            itemName: string;
            /**
             * Item product quantity.
             */
            quantity: number;
        }[];
        /**
         * Currencies included in the in-World product if {@link ProductType} is `CurrencyPackage`.
         */
        currencyPackageUnits?: {
            /**
             * Currency ID.
             */
            currencyId: string;
            /**
             * Currency name.
             */
            currencyName: string;
            /**
             * Currency quantity.
             */
            quantity: number;
        }[];
    }
    /**
     * Retrieves the in-World product information based on the provided product ID. Throws {@link ProductError}.
     * @param productId ID of the in-World product to fetch.
     * @returns `Promise` resolved upon completion, with the retrieved {@link ProductRecord} object.
     */
    function getProduct(productId: string): Promise<ProductRecord | null>;
    /**
     * Retrieves the in-World product information list based on provided product IDs. Throws {@link ProductError}.
     *
     * @param productIds IDs of the in-World products to fetch.
     * @returns `Promise` resolved upon completion, with a array of retrieved {@link ProductRecord} objects.
     */
    function getProducts(productIds: string[]): Promise<ProductRecord[] | null>;
}

declare module "ZEPETO.Multiplay.Schema" {

    export interface State {
		
	}
    
	export { Schema } from "@colyseus/schema";
}

