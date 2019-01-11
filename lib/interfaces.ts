import { Application, Channel, TypedChannel } from '@feathersjs/feathers';
import { AfterHook, AfterContext, BeforeHook, OutputHook, ValidateHook } from './hooks';

export type Merge2<T, U> = T extends void ? U : U extends void ? T : T & U;
export type Merge3<T, U, V> = T extends void ? Merge2<U, V> : T & Merge2<U, V>;
export type Merge4<T, U, V, W> = T extends void ? Merge3<U, V, W> : T & Merge3<U, V, W>;
export type Merge5<T, U, V, W, X> = T extends void ? Merge4<U, V, W, X> : T & Merge4<U, V, W, X>;

export type Publisher<I, P> = (data: I, hook: AfterContext<void, P, I>)
    => Channel | Channel[] | Promise<Channel> | Promise<Channel[]>;
export type MappedPublisher<I, O> = (data: I, hook: AfterContext<void, void, I>)
    => TypedChannel<O> | TypedChannel<O>[] | Promise<TypedChannel<O>> | Promise<TypedChannel<O>[]>;

export interface PublisherBuilder<T, OP, P, O> {
    publishTo(publisher: Publisher<O, P>): Builder<T, OP>;
    publishTo(publisher: Publisher<void, P>): Builder<T, OP>;
}

export interface MessageService<E extends string, O> {
    emit(method: E, data: O): void;
    on(message: E, callback: ((data: O) => void), caller?: string): void;
}

export interface FindService<O> {
    find(): Promise<O>;
}

export interface GetService<O> {
    get(id: string): Promise<O>;
}

export interface CreateService<I, O> {
    create(data: I): Promise<O>;
}
export interface CreateServiceMessage<I, O>
    extends CreateService<I, O>, MessageService<'created', O> {}

export interface UpdateService<I, O> {
    update(id: string, data: I): Promise<O>;
}
export interface UpdateServiceMessage<I, O>
    extends UpdateService<I, O>, MessageService<'updated', O> {}

export interface PatchService<I, O> {
    patch(id: string, data: I): Promise<O>;
}
export interface PatchServiceMessage<I, O>
    extends PatchService<I, O>, MessageService<'patched', O> {}

export interface RemoveService<O> {
    remove(id: string): Promise<O>;
}
export interface RemoveServiceMessage<O>
    extends RemoveService<O>, MessageService<'removed', O> {}

export type Method = 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove';

export type MethodType<M extends Method, I, P, O> =
    M extends 'get' | 'remove' ? ((id: string, params: P) => Promise<O>)
    : M extends 'create' ? ((data: I, params: P) => Promise<O>)
    : M extends 'update' | 'patch' ? ((id: string, data: I, params: P) => Promise<O>)
    : ((params: P) => Promise<O>);

export type BeforeBuilder<T, M extends Method, OP, I = void, P = OP> =
    BeforeMethods<T, M, OP, I, P> & Methods<T, M, OP, I, P>;

export interface BeforeMethods<T, M extends Method, OP, I, P> {
    /** Adds the provided before hook to the current method. */
    before<P2>(hook: BeforeHook<P, P2>): BeforeBuilder<T, M, OP, I, Merge2<P, P2>>;
    /** Adds the provided before hooks to the current method. Hooks run in parallel. */
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): BeforeBuilder<T, M, OP, I, Merge3<P, P2, P3>>;
    /** Adds the provided before hooks to the current method. Hooks run in parallel. */
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): BeforeBuilder<T, M, OP, I, Merge4<P, P2, P3, P4>>;
    /** Adds the provided before hooks to the current method. Hooks run in parallel. */
    before<P2, P3, P4, P5>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>,
        hook4: BeforeHook<P, P5>): BeforeBuilder<T, M, OP, I, Merge5<P, P2, P3, P4, P5>>;
}

export interface InputMethod<T, M extends Method, OP, I, P> {
    validateInput<I2>(hook: ValidateHook<I2, Partial<P> | void>): BeforeBuilder<T, M, OP, Merge2<I, I2>, P>;
    validateInput<I2, I3>(hook: ValidateHook<I2, Partial<P> | void>,
        hook2: ValidateHook<I3, Partial<P> | void>): BeforeBuilder<T, M, OP, Merge3<I, I2, I3>, P>;
    validateInput<I2, I3, I4>(hook: ValidateHook<I2, Partial<P> | void>,
        hook2: ValidateHook<I3, Partial<P> | void>,
        hook3: ValidateHook<I4, Partial<P> | void>): BeforeBuilder<T, M, OP, Merge4<I, I2, I3, I4>, P>;
}

export interface PublishableMethod<T, M extends Method, OP, P> {
    internalPublished<I, O>(method: MethodType<M, I, P, O>): PublisherBuilder<T & ToMessageService<M, I, O>, OP, P, O>;
}

export interface InternalMethod<T, M extends Method, OP, P> {
    internalOnly<I, O>(method: MethodType<M, I, P, O>): Builder<T & ToService<M, I, O>, OP>;
}

export interface CallMethod<T, M extends Method, OP, I, P> {
    method<O>(method: MethodType<M, I, P, O>): AfterBuilder<T, M, OP, I, P, O>;
}

export interface DatalessMethod<T, M extends Method, OP, P>
    extends InternalMethod<T, M, OP, P>, CallMethod<T, M, OP, void, P> { }

export interface ValidatedMethod<T, M extends Method, OP, I, P>
    extends InputMethod<T, M, OP, I, P>, CallMethod<T, M, OP, I, P> {
    internalOnly<O>(method: MethodType<M, I, P, O>): Builder<T & ToService<M, I, O>, OP>;
    internalPublished<O>(method: MethodType<M, I, P, O>): PublisherBuilder<T & ToMessageService<M, I, O>, OP, P, O>;
}

export interface UnvalidatedMethod<T, M extends Method, OP, P>
    extends InputMethod<T, M, OP, void, P>, PublishableMethod<T, M, OP, P>,
    InternalMethod<T, M, OP, P> {
    ignoresInput<O>(method: MethodType<M, void, P, O>): AfterBuilder<T, M, OP, {}, P, O>;
}

export type Methods<T, M extends Method, OP, I, P> =
    I extends void
        ? M extends 'remove' ? DatalessMethod<T, M, OP, P> & PublishableMethod<T, M, OP, P>
            : M extends 'create' | 'update' | 'patch' ? UnvalidatedMethod<T, M, OP, P>
            : DatalessMethod<T, M, OP, P>
        : ValidatedMethod<T, M, OP, I, P>;

export type ToFormat<T, M extends Method, OP, I, P, O> =
    M extends 'get' ? Builder<T & GetService<O>, OP>
    : M extends 'find' ? Builder<T & FindService<O>, OP>
    : FormattedBuilder<T, M, OP, I, P, O>;

export type ToMessageService<M extends Method, I, O> =
    M extends 'create' ? CreateServiceMessage<I, O>
    : M extends 'update' ? UpdateServiceMessage<I, O>
    : M extends 'patch' ? PatchServiceMessage<I, O>
    : RemoveServiceMessage<O>;

export type ToService<M extends Method, I, O> =
    M extends 'get' ? GetService<O>
    : M extends 'find' ? FindService<O>
    : M extends 'create' ? CreateService<I, O>
    : M extends 'update' ? UpdateService<I, O>
    : M extends 'patch' ? PatchService<I, O>
    : RemoveService<O>;

export interface AfterBuilder<T, M extends Method, OP, I, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, I | void>): AfterBuilder<T, M, OP, I, Merge2<P, P2>, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>): AfterBuilder<T, M, OP, I, Merge3<P, P2, P3>, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>,
        hook3: AfterHook<P, P4, O | void, I | void>): AfterBuilder<T, M, OP, I, Merge4<P, P2, P3, P4>, O>;
    after<P2, P3, P4, P5>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>, hook3: AfterHook<P, P4, O | void, I | void>,
        hook4: AfterHook<P, P5, O | void, I | void>): AfterBuilder<T, M, OP, I, Merge5<P, P2, P3, P4, P5>, O>;

    format<O2>(formatter: (data: O) => O2): ToFormat<T, M, OP, I, P, O2>;
    formatHook<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): ToFormat<T, M, OP, I, Merge2<P, P2>, O2>
    formatHook<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): ToFormat<T, M, OP, I, Merge3<P, P2, P3>, O3>;
    formatHook<P2, O2, P3, O3, P4, O4>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>,
        hook3: OutputHook<Partial<P & P2 & P3>, P4, O3, O4, I | void>): ToFormat<T, M, OP, I, Merge4<P, P2, P3, P4>, O4>;
    unformatted(): ToFormat<T, M, OP, I, P, O>;
}

export interface FormattedBuilder<T, M extends Method, OP, I, P, O> extends PublisherBuilder<T & ToMessageService<M, I, O>, OP, P, O> {
    silent(): Builder<T & ToService<M, I, O>, OP>;
}

export interface ServiceProps {
    readonly events: ReadonlyArray<string>;
    removeAllListeners(): void;
}

export interface CustomEventBuilder<S> {
    customEventPublisher<E extends string, T>(event: E,
        publisher: Publisher<T, void>): CustomEventBuilder<S & MessageService<E, T>>;
    customEventMapped<E extends string, I, O>(event: E,
        publisher: MappedPublisher<I, O>): CustomEventBuilder<S & MessageService<E, O>>;
    customEventInternal<E extends string, T>(event: E): CustomEventBuilder<S & MessageService<E, T>>;
    build(path: string, app: Application): ServiceProps & S;
}

export interface Builder<S, P> extends CustomEventBuilder<S> {
    beforeAll<P2>(hook: BeforeHook<P, P2>): Builder<S, Merge2<P, P2>>;
    find(): BeforeBuilder<S, 'find', P>;
    get(): BeforeBuilder<S, 'get', P>;
    create(): BeforeBuilder<S, 'create', P>;
    update(): BeforeBuilder<S, 'update', P>;
    patch(): BeforeBuilder<S, 'patch', P>;
    remove(): BeforeBuilder<S, 'remove', P>;
    afterAll(hook: AfterHook<any, any, any, void>): this;
    build(path: string, app: Application): ServiceProps & S;
}
