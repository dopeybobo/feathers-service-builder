import { Application } from '@feathersjs/feathers';

export type HookResult<T> = Promise<T | void> | T | void;

export interface AfterHook<P, P2, O, I> {
    (hook: AfterParams<I, P, O>): HookResult<AfterParams<I, P2, O>>;
}

export interface OutputHook<P, P2, O, O2, I> {
    (hook: AfterParams<I, P, O>): HookResult<AfterParams<I, P2, O2>>;
}

export interface ValidateHook<I2, P> {
    (hook: BeforeParams<void, P>): HookResult<BeforeParams<I2, P>>;
}

export interface BeforeHook<P, P2> {
    (hook: BeforeParams<void, P>): HookResult<BeforeParams<void, P2>>;
    <I>(hook: BeforeParams<I, P>): HookResult<BeforeParams<I, P2>>;
}

export interface HookParams<I, P> {
    readonly app: Application;
    readonly service: any;
    readonly path: string;
    readonly method: 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove';
    readonly type: 'before' | 'after' | 'error';
    id?: string;
    params: P;
    data: I;
}

export interface BeforeParams<I, P> extends HookParams<I, P> {
    readonly type: 'before';
    result?: any;
}

export interface AfterParams<I, P, O> extends HookParams<I, P> {
    readonly type: 'after';
    readonly data: I;
    result: O;
}
