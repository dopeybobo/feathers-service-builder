import { Application } from '@feathersjs/feathers';

export type HookResult<T> = Promise<T | void> | T | void;

export interface AfterHook<O, P = unknown, P2 = P, I = unknown> {
    (hook: AfterContext<P, O, I>): HookResult<AfterContext<P2, O, I>>;
}

export interface OutputHook<O, O2 = O, P = unknown, P2 = P, I = unknown> {
    (hook: AfterContext<P, O, I>): HookResult<AfterContext<P2, O2, I>>;
}

export interface ValidateHook<I, P = unknown> {
    (hook: BeforeContext<P, I>): HookResult<BeforeContext<P, I>>;
}

export interface BeforeHook<P2, P = unknown> {
    (hook: BeforeContext<P>): HookResult<BeforeContext<P2>>;
    <I>(hook: BeforeContext<P, I>): HookResult<BeforeContext<P2, I>>;
}

export interface HookContext<P = unknown, I = unknown> {
    readonly app: Application;
    readonly service: any;
    readonly path: string;
    readonly method: 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove';
    readonly type: 'before' | 'after' | 'error';
    id?: string;
    params: P;
    data: I;
}

export interface BeforeContext<P = unknown, I = unknown> extends HookContext<P, I> {
    readonly type: 'before';
    result?: any;
}

export interface AfterContext<P = unknown, O = unknown, I = unknown> extends HookContext<P, I> {
    readonly type: 'after';
    readonly data: I;
    result: O;
}
