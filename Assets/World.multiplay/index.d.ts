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
    import { ChangeTree } from "changes/ChangeTree";
    import { SchemaDecoderCallbacks } from "Schema";
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
    import { ChangeTree } from "changes/ChangeTree";
    import { SchemaDecoderCallbacks } from "Schema";
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
    import { ChangeTree } from "changes/ChangeTree";
    import { SchemaDecoderCallbacks } from "Schema";
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
    import { ChangeTree } from "changes/ChangeTree";
    import { SchemaDecoderCallbacks } from "Schema";
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
    import { ChangeTree } from "changes/ChangeTree";
    import { ClientWithSessionId } from "annotations";
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
    import { OPERATION } from "spec";
    import { ClientWithSessionId, Context, SchemaDefinition, DefinitionType } from "annotations";
    import type { Iterator } from "encoding/decode";
    import { ChangeTree, Ref } from "changes/ChangeTree";
    import { NonFunctionPropNames } from "types/HelperTypes";
    import { EventEmitter_ } from "events/EventEmitter";
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
    import { OPERATION } from "spec";
    import { Schema } from "Schema";
    import { FilterChildrenCallback } from "annotations";
    import { MapSchema } from "types/MapSchema";
    import { ArraySchema } from "types/ArraySchema";
    import { CollectionSchema } from "types/CollectionSchema";
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
    import { ArraySchema } from "types/ArraySchema";
    import { Iterator } from "encoding/decode";
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
    export { Schema, DataChange } from "Schema";
    import { MapSchema } from "types/MapSchema";
    export { MapSchema };
    import { ArraySchema } from "types/ArraySchema";
    export { ArraySchema };
    import { CollectionSchema } from "types/CollectionSchema";
    export { CollectionSchema };
    import { SetSchema } from "types/SetSchema";
    export { SetSchema };
    import { registerType } from "types/index";
    export { registerType };
    export { dumpChanges } from "utils";
    export { Iterator } from "encoding/decode";
    import * as encode from "encoding/encode";
    import * as decode from "encoding/decode";
    export { encode, decode };
    export { Reflection, ReflectionType, ReflectionField, } from "Reflection";
    export { type, deprecated, filter, filterChildren, defineTypes, hasFilter, SchemaDefinition, Context, PrimitiveType, Definition, DefinitionType, FilterCallback, } from "annotations";
    export { OPERATION } from "spec";
}


declare module "ZEPETO.Multiplay" {

    import { State, Schema } from 'ZEPETO.Multiplay.Schema';
    
    interface SystemError {
        code: string,
        message: string
    }

    interface SandboxPlayer {
        readonly sessionId: string;
        readonly userId: string;
        readonly hashCode?: string;
        
        send<T>(type: string | number, message?: T): void;
        send(message: Schema): void;
    }

    class BroadcastMessage {
        sender: string;
        data: any;
        constructor(sender: string, data: any);
    }

    interface IBroadcastOptions {
        except?: SandboxPlayer;
    }

    interface SandboxOptions {
        readonly applicationId: string;
        readonly isSandbox: boolean;
        readonly tickInterval: number;
        readonly isPrivate: boolean;
        readonly matchMakingValue: {[key: string]: any};
    }
    
    abstract class Sandbox {
        readonly applicationId: string;
        readonly locked: boolean;
        readonly metadata: any;
        readonly clock: any;
        readonly roomId: string;
        readonly roomType: string;
        readonly uniqueId?: string;
        readonly maxClients: number;
        readonly patchRate: number;
        readonly autoDispose: boolean;
        readonly state: State;
        readonly clients: IterableIterator<SandboxPlayer>;
        readonly allowReconnectionTime: number;
        readonly private: boolean;
        abstract onCreate?(options: SandboxOptions): void | Promise<void>;
        abstract onJoin?(client: SandboxPlayer): void | Promise<void>;
        abstract onLeave?(client: SandboxPlayer, consented?: boolean): void | Promise<void>;
        lock(): Promise<void>;
        unlock(): Promise<void>;
        onTick?(deltaTime: number): void;
        onMessage<T = any>(messageType: '*' | string | number, callback: (client: SandboxPlayer, message: T) => void): void;
        broadcast(type: string | number, message?: any, options?: IBroadcastOptions): void;
        loadPlayer(sessionId: string): SandboxPlayer | undefined;
        setPrivate(isPrivate: boolean): Promise<void>;
        kick(client: SandboxPlayer, reason?: string): Promise<void>;
    }
}


declare module "ZEPETO.Multiplay.Currency" {
    import { SandboxPlayer } from "ZEPETO.Multiplay";
    const enum CurrencyError {
        Unknown = -1,
        NetworkError = 0
    }
    interface Currency {
        debit(id: string, quantity?: number, reason?: string): Promise<boolean>;
        credit(id: string, quantity?: number, reason?: string): Promise<boolean>;
        getBalance(id: string): Promise<number | null>;
        getBalances(): Promise<{
            [key: string]: number
        }>;
    }
    function loadCurrency(userId: string): Promise<Currency>;
    function loadCurrency(player: SandboxPlayer): Promise<Currency>;
}

declare module 'ZEPETO.Multiplay.DataStorage' {
    const enum DataStorageError {
        Unknown = -1,
        NetworkError = 0,
        KeyConstraintViolated = 103,
        ValueConstraintViolated = 104
    }
    interface DataStorage {
        set<T>(key: string, value: T) : Promise<boolean>;
        mset<T>(keyValueSet: { key: string; value: T; }[]): Promise<boolean>;
        get<T>(key: string): Promise<T>;
        mget<T>(keys: string[]): Promise<{ [key: string]: T }>;
        remove(key: string): Promise<boolean>;
    }
    function loadDataStorage(userId: string): Promise<DataStorage>;
}

declare module 'ZEPETO.Multiplay' {
    import { DataStorage } from 'ZEPETO.Multiplay.DataStorage';
    interface SandboxPlayer {
        loadDataStorage(): DataStorage;
    }
}


declare module "ZEPETO.Multiplay.HttpService" {
    const enum HttpContentType {
        ApplicationJson = 'application/json',
        ApplicationXml = 'application/xml',
        ApplicationUrlEncoded = 'application/x-www-form-urlencoded',
        TextPlain = 'text/plain',
        TextXml = 'text/xml'
    }
    type HttpBodyType = string | { [key: string]: any; };
    type HttpHeader = { [key: string]: string | number; };
    const enum HttpErrorType {
        ERR_ACCESS_DENIED = 'ERR_ACCESS_DENIED',
        ERR_LENGTH_REQUIRED = 'ERR_LENGTH_REQUIRED'
    }
    interface HttpError extends Error {
        message: string;
        code?: string;
    }
    interface HttpResponse {
        readonly statusCode: number;
        readonly statusText: string;
        readonly response: string;
    }
    interface HttpService {
        getAsync(url: string, headers?: HttpHeader): Promise<HttpResponse>;
        postAsync(url: string, body: HttpBodyType, headers?: HttpHeader): Promise<HttpResponse>;
        postAsync(url: string, body: HttpBodyType, httpContentType: HttpContentType, headers?: HttpHeader): Promise<HttpResponse>;
    }
    const HttpService: HttpService;
}

/**
 * @deprecated The module should not be used
 */
declare module "ZEPETO.Multiplay.IWP" {
    import { SandboxPlayer } from "ZEPETO.Multiplay";

    /**
     * @deprecated The interface should not be used
     */
    interface IReceiptMessage {
        receiptId: string;
        itemId: string;
        worldId: string;
        purchasePrice: number;
        status: string;
        purchasedAt: string;
        createdAt: string;
        updatedAt: string;
    }

    /**
     * @deprecated The interface should not be used
     */
    interface IWP {
        /**
         * @deprecated The function should not be used
         */
        onPurchased(client: SandboxPlayer, receipt: IReceiptMessage): void | Promise<void>;
    }
}

declare module "ZEPETO.Multiplay.Inventory" {
    import { SandboxPlayer } from "ZEPETO.Multiplay";
    const enum InventoryError {
        Unknown = -1,
        NetworkError = 0
    }
    interface InventoryRecord {
        productId: string;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }
    interface Inventory {
        use(productId: string, quantity?: number, reason?: string): Promise<boolean>;
        add(productId: string, quantity?: number, reason?: string): Promise<boolean>;
        madd(products: {
            productId: string;
            quantity: number;
            reason?: string;
        }[]): Promise<boolean>;
        get(productId: string): Promise<InventoryRecord | null>;
        has(productId: string): Promise<boolean>;
        remove(productId: string): Promise<boolean>;
        list(): Promise<InventoryRecord[]>;
    }
    function loadInventory(userId: string): Promise<Inventory>;
    function loadInventory(player: SandboxPlayer): Promise<Inventory>;
}

declare module 'ZEPETO.Multiplay.Leaderboard' {
    const LeaderboardWeekDayType: {
        MONDAY: string;
        TUESDAY: string;
        WEDNESDAY: string;
        THURSDAY: string;
        FRIDAY: string;
        SATURDAY: string;
        SUNDAY: string;
    };
    type LeaderboardWeekDayType = typeof LeaderboardWeekDayType[keyof typeof LeaderboardWeekDayType];

    enum ResetRule
    {
        none = 0,
        day = 1,
        week = 2,
        month = 3,
    }

    enum UpdateRule
    {
        max_score = 0,
        min_score = 1,
        accumulate_score = 2,
    }

    interface ResetInfo {
        customResetStartTimestamp: number;
        day: number;
        hour: number;
        min: number;
        resetRule: ResetRule;
        sec: number;
        weekDay: LeaderboardWeekDayType;
    }

    interface Leaderboard {
        id: string;
        name: string;
        resetInfoList: ResetInfo[];
        updateRule: UpdateRule;
    }

    interface ResponseBase {
        isSuccess: boolean;
        error?: string;
    }

    interface LeaderboardResponse extends ResponseBase {
        exception?: string;
    }

    interface Rank {
        extraInfo: string;
        userId: string;
        rank: number;
        score: number;
    }

    interface RankInfo {
        rankList: Rank[];
        totalRankCount: number;
    }

    interface GetAllLeaderboardsResponse extends LeaderboardResponse {
        leaderboards?: Leaderboard[];
    }

    interface GetLeaderboardResponse extends LeaderboardResponse {
        leaderboard?: Leaderboard;
    }

    interface GetLeaderboardRankResponse extends LeaderboardResponse {
        rankInfo?: RankInfo;
    }

    interface Leaderboard {
        getAllLeaderboards(): Promise<GetAllLeaderboardsResponse>;
        getLeaderboard(leaderboardId: string): Promise<GetLeaderboardResponse>;
        getRank(leaderboardId: string, userIds: string[], resetRule: ResetRule, prevRanking?: boolean): Promise<GetLeaderboardRankResponse>;
        getRankRange(leaderboardId: string, startRank: number, endRank: number, resetRule: ResetRule, prevRanking?: boolean): Promise<GetLeaderboardRankResponse>;
        setScore(leaderboardId: string, userId: string, score: number, prevRanking?: boolean): Promise<LeaderboardResponse>;
        deleteRank(leaderboardId: string, userId: string, prevRanking?: boolean): Promise<LeaderboardResponse>;
    }
    const Leaderboard: Leaderboard;
}


declare module "ZEPETO.Multiplay.Messaging" {
    const enum MessagingError {
        Unknown = -1,
        ParameterError,
        NetworkError,
    }
    interface Subscriber {
        disconnect(): void;
    }
    interface Messaging {
        publish<T>(topic: string, payload: T): void;
        subscribe<T>(topic: string, callback: (topic: string, data: T, sent: number) => void): Subscriber;
    }
    const Messaging: Messaging;
}

declare module "ZEPETO.Multiplay.Product" {
    const enum ProductError {
        Unknown = -1,
        NetworkError = 0
    }
    const enum PurchaseType {
        Consumable = 'CONSUMABLE',
        NonConsumable = 'NON_CONSUMABLE'
    }
    const enum ProductStatus {
        Active = 'ACTIVE',
        InActive = 'INACTIVE',
        Forbidden = 'FORBIDDEN'
    }
    const enum ProductType {
        Item = 'ITEM',
        ItemPackage = 'ITEM_PACKAGE',
        CurrencyPackage = 'CURRENCY_PACKAGE'
    }
    interface ProductRecord {
        productId: string;
        name: string;
        price: number;
        purchaseType: PurchaseType;
        status: ProductStatus;
        productType: ProductType,
        currency: {
            currencyId?: string;
            name?: string,
            isOfficialCurrency: boolean,
        };
        itemPackageUnits?: {
            productId: string;
            itemName: string;
            quantity: number;
        }[];
        currencyPackageUnits?: {
            currencyId: string;
            currencyName: string;
            quantity: number;
        }[];
    }
    function getProduct(productId: string): Promise<ProductRecord | null>;
    function getProducts(productIds: string[]): Promise<ProductRecord[] | null>;
}

declare module "ZEPETO.Multiplay.Schema" {

    export interface State {
		
	}
    
	export { Schema } from "@colyseus/schema";
}

