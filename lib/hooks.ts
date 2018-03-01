import { Application } from '@feathersjs/feathers';

export type HookResult<T> = Promise<T | void> | T | void;

export interface AfterHook<P, P2, O, I> {
    (hook: AfterContext<I, P, O>): HookResult<AfterContext<I, P2, O>>;
}

export interface OutputHook<P, P2, O, O2, I> {
    (hook: AfterContext<I, P, O>): HookResult<AfterContext<I, P2, O2>>;
}

export interface ValidateHook<I2, P = void> {
    (hook: BeforeContext<void, P>): HookResult<BeforeContext<I2, P>>;
}

export interface BeforeHook<P, P2> {
    (hook: BeforeContext<void, P>): HookResult<BeforeContext<void, P2>>;
    <I>(hook: BeforeContext<I, P>): HookResult<BeforeContext<I, P2>>;
}

export interface HookContext<I, P> {
    readonly app: Application;
    readonly service: any;
    readonly path: string;
    readonly method: 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove';
    readonly type: 'before' | 'after' | 'error';
    id?: string;
    params: P;
    data: I;
}

export interface BeforeContext<I, P> extends HookContext<I, P> {
    readonly type: 'before';
    result?: any;
}

export interface AfterContext<I, P, O> extends HookContext<I, P> {
    readonly type: 'after';
    readonly data: I;
    result: O;
}
