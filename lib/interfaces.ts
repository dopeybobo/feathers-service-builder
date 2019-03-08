import { Application } from '@feathersjs/feathers';
import { AfterContext, AfterHook, BeforeHook, OutputHook, ValidateHook } from './hooks';

export interface Connection { }

export interface Channel {
    readonly connections: Connection[];
    readonly length: number;
    filter(filter: ((connection: Connection) => boolean)): Channel;
    join(...connections: Connection[]): this;
    leave(...connections: Connection[]): this;
    leave(filter: ((connection: Connection) => boolean)): this;
    send<T>(data: T): TypedChannel<T>;
}

export interface TypedChannel<T> extends Channel { }

export type Publisher<I, P> = (data: I, hook: AfterContext<P, I>)
    => Channel | Channel[] | Promise<Channel> | Promise<Channel[]>;
export type MappedPublisher<I, O> = (data: I, hook: AfterContext<unknown, I>)
    => TypedChannel<O> | TypedChannel<O>[] | Promise<TypedChannel<O>> | Promise<TypedChannel<O>[]>;

interface PublisherBuilder<T, OP, P, O> {
    publishTo(publisher: Publisher<O, P>): Builder<T, OP>;
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

type BeforeBuilder<T, M extends Method, OP, I = void, P = OP> =
    BeforeMethods<T, M, OP, I, P> & Methods<T, M, OP, I, P>;

interface BeforeMethods<T, M extends Method, OP, I, P> {
    /** Adds the provided before hook to the current method. */
    before<P2>(hook: BeforeHook<P2, P>): BeforeBuilder<T, M, OP, I, P & P2>;
    /** Adds the provided before hooks to the current method. Hooks run in parallel. */
    before<P2, P3>(hook: BeforeHook<P2, P>,
        hook2: BeforeHook<P3, P>): BeforeBuilder<T, M, OP, I, P & P2 & P3>;
    /** Adds the provided before hooks to the current method. Hooks run in parallel. */
    before<P2, P3, P4>(hook: BeforeHook<P2, P>, hook2: BeforeHook<P3, P>,
        hook3: BeforeHook<P4, P>): BeforeBuilder<T, M, OP, I, P & P2 & P3 & P4>;
    /** Adds the provided before hooks to the current method. Hooks run in parallel. */
    before<P2, P3, P4, P5>(hook: BeforeHook<P2, P>, hook2: BeforeHook<P3, P>,
        hook3: BeforeHook<P4, P>,
        hook4: BeforeHook<P5, P>): BeforeBuilder<T, M, OP, I, P & P2 & P3 & P4 & P5>;
}

type InputHook<I, P> = ValidateHook<I, Partial<P>> | ValidateHook<I>;
type Merge<T, U> = T extends void ? U : T & U;

interface InputMethod<T, M extends Method, OP, I, P> {
    validateInput<I2>(hook: InputHook<I2, P>): BeforeBuilder<T, M, OP, Merge<I, I2>, P>;
    validateInput<I2, I3>(hook: InputHook<I2, P>,
        hook2: InputHook<I3, P>): BeforeBuilder<T, M, OP, Merge<I, I2 & I3>, P>;
    validateInput<I2, I3, I4>(hook: InputHook<I2, P>, hook2: InputHook<I3, P>,
        hook3: InputHook<I4, P>): BeforeBuilder<T, M, OP, Merge<I, I2 & I3 & I4>, P>;
    validateInput<I2, I3, I4, I5>(hook: InputHook<I2, P>, hook2: InputHook<I3, P>,
        hook3: InputHook<I4, P>,
        hook4: InputHook<I5, P>): BeforeBuilder<T, M, OP, Merge<I, I2 & I3 & I4 & I5>, P>;
}

interface PublishableMethod<T, M extends Method, OP, P> {
    internalPublished<I, O>(
        method: MethodType<M, I, P, O>): PublisherBuilder<T & ToMessageService<M, I, O>, OP, P, O>;
}

interface InternalMethod<T, M extends Method, OP, P> {
    internalOnly<I, O>(method: MethodType<M, I, P, O>): Builder<T & ToService<M, I, O>, OP>;
}

interface CallMethod<T, M extends Method, OP, I, P> {
    method<O>(method: MethodType<M, I, P, O>): AfterBuilder<T, M, OP, I, P, O>;
}

interface DatalessMethod<T, M extends Method, OP, P>
    extends InternalMethod<T, M, OP, P>, CallMethod<T, M, OP, void, P> { }

interface ValidatedMethod<T, M extends Method, OP, I, P>
    extends InputMethod<T, M, OP, I, P>, CallMethod<T, M, OP, I, P> {
    internalOnly<O>(method: MethodType<M, I, P, O>): Builder<T & ToService<M, I, O>, OP>;
    internalPublished<O>(
        method: MethodType<M, I, P, O>): PublisherBuilder<T & ToMessageService<M, I, O>, OP, P, O>;
}

interface UnvalidatedMethod<T, M extends Method, OP, P>
    extends InputMethod<T, M, OP, unknown, P>, PublishableMethod<T, M, OP, P>,
    InternalMethod<T, M, OP, P> {
    ignoresInput<O>(method: MethodType<M, void, P, O>): AfterBuilder<T, M, OP, unknown, P, O>;
}

type Methods<T, M extends Method, OP, I, P> =
    I extends void
        ? M extends 'remove' ? DatalessMethod<T, M, OP, P> & PublishableMethod<T, M, OP, P>
            : M extends 'create' | 'update' | 'patch' ? UnvalidatedMethod<T, M, OP, P>
            : DatalessMethod<T, M, OP, P>
        : ValidatedMethod<T, M, OP, I, P>;

type ToFormat<T, M extends Method, OP, I, P, O> =
    M extends 'get' ? Builder<T & GetService<O>, OP>
    : M extends 'find' ? Builder<T & FindService<O>, OP>
    : FormattedBuilder<T, M, OP, I, P, O>;

type ToMessageService<M extends Method, I, O> =
    M extends 'create' ? CreateServiceMessage<I, O>
    : M extends 'update' ? UpdateServiceMessage<I, O>
    : M extends 'patch' ? PatchServiceMessage<I, O>
    : RemoveServiceMessage<O>;

type ToService<M extends Method, I, O> =
    M extends 'get' ? GetService<O>
    : M extends 'find' ? FindService<O>
    : M extends 'create' ? CreateService<I, O>
    : M extends 'update' ? UpdateService<I, O>
    : M extends 'patch' ? PatchService<I, O>
    : RemoveService<O>;

type FormatHook<O, O2, P, P2, I> = OutputHook<O, O2, Partial<P>, P2, I | unknown>;

interface FormatBuilder<T, M extends Method, OP, I, P, O> {
    format<O2>(formatter: (data: O) => O2): ToFormat<T, M, OP, I, P, O2>;
    formatHook<P2, O2>(hook: FormatHook<O, O2, P, P2, I>): ToFormat<T, M, OP, I, P & P2, O2>
    formatHook<P2, O2, P3, O3>(hook: FormatHook<O, O2, P, P2, I>,
        hook2: FormatHook<O2, O3, P & P2, P3, I>): ToFormat<T, M, OP, I, P & P2 & P3, O3>;
    formatHook<P2, O2, P3, O3, P4, O4>(hook: FormatHook<O, O2, P, P2, I>,
        hook2: FormatHook<O2, O3, P & P2, P3, I>,
        hook3: FormatHook<O3, O4, P & P2 & P3, P4, I>): ToFormat<T, M, OP, I, P & P2 & P3 & P4, O4>;
    unformatted(): ToFormat<T, M, OP, I, P, O>;
}

type After<O, P, P2, I> = AfterHook<O | unknown, P, P2, I | unknown>;

interface AfterBuilder<T, M extends Method, OP, I, P, O>
    extends FormatBuilder<T, M, OP, I, P, O> {
    after<P2>(hook: After<O, P, P2, I>): AfterBuilder<T, M, OP, I, P & P2, O>;
    after<P2, P3>(hook: After<O, P, P2, I>,
        hook2: After<O, P, P3, I>): AfterBuilder<T, M, OP, I, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: After<O, P, P2, I>, hook2: After<O, P, P3, I>,
        hook3: After<O, P, P4, I>): AfterBuilder<T, M, OP, I, P & P2 & P3 & P4, O>;
    after<P2, P3, P4, P5>(hook: After<O, P, P2, I>, hook2: After<O, P, P3, I>,
        hook3: After<O, P, P4, I>,
        hook4: After<O, P, P5, I>): AfterBuilder<T, M, OP, I, P & P2 & P3 & P4 & P5, O>;
}

interface FormattedBuilder<T, M extends Method, OP, I, P, O>
    extends PublisherBuilder<T & ToMessageService<M, I, O>, OP, P, O> {
    silent(): Builder<T & ToService<M, I, O>, OP>;
}

interface ServiceProps {
    readonly events: ReadonlyArray<string>;
    removeAllListeners(): void;
}

interface CustomEventBuilder<S> {
    customEventPublisher<E extends string, T>(event: E,
        publisher: Publisher<T, unknown>): CustomEventBuilder<S & MessageService<E, T>>;
    customEventMapped<E extends string, I, O>(event: E,
        publisher: MappedPublisher<I, O>): CustomEventBuilder<S & MessageService<E, O>>;
    customEventInternal<E extends string, T>(event: E): CustomEventBuilder<S & MessageService<E, T>>;
    build(path: string, app: Application): ServiceProps & S;
}

export interface Builder<S, P> extends CustomEventBuilder<S> {
    beforeAll<P2>(hook: BeforeHook<P2, P>): Builder<S, P & P2>;
    find(): BeforeBuilder<S, 'find', P>;
    get(): BeforeBuilder<S, 'get', P>;
    create(): BeforeBuilder<S, 'create', P>;
    update(): BeforeBuilder<S, 'update', P>;
    patch(): BeforeBuilder<S, 'patch', P>;
    remove(): BeforeBuilder<S, 'remove', P>;
    afterAll(hook: AfterHook<unknown, P, unknown, void>): this;
    build(path: string, app: Application): ServiceProps & S;
}
