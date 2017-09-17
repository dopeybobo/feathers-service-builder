import { Application } from 'feathers';
import { AfterHook, AfterParams, BeforeHook, ValidateHook } from './hooks';

// tslint:disable:no-any
export type Filter<I, O = I, H extends AfterParams<any, any, I> = any> =
    (data: I, connection: any, hook: H) => Promise<O | false> | O | false;
// tslint:enable:no-any

export interface FindService<O> {
    find(): Promise<O>;
}

export interface FindBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): FindBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): FindBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): FindBuilder<T, OP, P & P2 & P3 & P4>;
    method<O>(method: ((params: P) => Promise<O>)): FindBuilderAfter<T, OP, P, O>;
}

export interface FindBuilderAfter<T, OP, P, O> {
    after<P2, O2>(hook: AfterHook<void, P, P2, O, O2>): FindBuilderAfter<T, OP, P2, O2>;
    after<P2, P3>(hook: AfterHook<void, P, P2, O, O>,
        hook2: AfterHook<void, P, P3, O, O>): FindBuilderAfter<T, OP, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<void, P, P2, O, O>, hook2: AfterHook<void, P, P2, O, O>,
        hook3: AfterHook<void, P, P3, O, O>): FindBuilderAfter<T, OP, P & P2 & P3 & P4, O>;
    apply(): Builder<T & FindService<O>, OP>;
}

export interface GetService<O> {
    get(id: string): Promise<O>;
}

export interface GetBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): GetBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): GetBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): GetBuilder<T, OP, P & P2 & P3 & P4>;
    method<O>(method: ((id: string, params: P) => Promise<O>)): GetBuilderAfter<T, OP, P, O>;
}

export interface GetBuilderAfter<T, OP, P, O> {
    after<P2, O2>(hook: AfterHook<void, P, P2, O, O2>): GetBuilderAfter<T, OP, P2, O2>;
    apply(): Builder<T & GetService<O>, OP>;
}

export interface CreateService<I, O> {
    create(data: I): Promise<O>;
}

export interface CreateServiceMessage<I, O, F> extends CreateService<I, O> {
    on(message: 'created', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface CreateBuilder<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): CreateBuilder<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): CreateBuilder<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): CreateBuilder<T, OP, I, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((data: void, params: P) => Promise<O>)): CreateBuilderAfter<T, OP, {}, P, O>;
    validateInput<I2, P2 extends Partial<P>>(hook: ValidateHook<I2, P2>): CreateBuilderValidated<T, OP, I2, P>;
}

export interface CreateBuilderValidated<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): CreateBuilderValidated<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): CreateBuilderValidated<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): CreateBuilderValidated<T, OP, I, P & P2 & P3 & P4>;
    validateInput<I2, P2 extends Partial<P>>(hook: ValidateHook<I2, P2>): CreateBuilderValidated<T, OP, I2, P>;
    method<O>(method: ((data: I, params: P) => Promise<O>)): CreateBuilderAfter<T, OP, I, P, O>;
}

export interface CreateBuilderAfter<T, OP, I, P, O> {
    after<P2, O2>(hook: AfterHook<void, P, P2, O, O2>): CreateBuilderAfter<T, OP, I, P2, O2>;
    filter<O2>(filter: Filter<O, O2, AfterParams<I, P, O>>): CreateBuilderFiltered<T, OP, I, P, O, O2>;
    noMessages(): Builder<T & CreateService<I, O>, OP>;
    apply(): Builder<T & CreateServiceMessage<I, O, O>, OP>;
}

export interface CreateBuilderFiltered<T, OP, I, P, O, F> {
    filter<O2>(filter: Filter<O, O2, AfterParams<I, P, O>>): CreateBuilderFiltered<T, OP, I, P, O, O2>;
    apply(): Builder<T & CreateServiceMessage<I, O, F>, OP>;
}

export interface UpdateService<I, O> {
    update(id: string, data: I): Promise<O>;
}

export interface UpdateServiceMessage<I, O, F> extends UpdateService<I, O> {
    on(message: 'updated', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface UpdateBuilder<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): UpdateBuilder<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): UpdateBuilder<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): UpdateBuilder<T, OP, I, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((id: string, data: void, params: P) => Promise<O>)): UpdateBuilderAfter<T, OP, {}, P, O>;
    validateInput<I2, P2 extends Partial<P>>(hook: ValidateHook<I2, P2>): UpdateBuilderValidated<T, OP, I2, P>;
}

export interface UpdateBuilderValidated<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): UpdateBuilderValidated<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): UpdateBuilderValidated<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): UpdateBuilderValidated<T, OP, I, P & P2 & P3 & P4>;
    validateInput<I2, P2 extends Partial<P>>(hook: ValidateHook<I2, P2>): UpdateBuilderValidated<T, OP, I2, P>;
    method<O>(method: ((id: string, data: I, params: P) => Promise<O>)): UpdateBuilderAfter<T, OP, I, P, O>;
}

export interface UpdateBuilderAfter<T, OP, I, P, O> {
    after<P2, O2>(hook: AfterHook<void, P, P2, O, O2>): UpdateBuilderAfter<T, OP, I, P2, O2>;
    filter<O2>(filter: Filter<O, O2, AfterParams<I, P, O>>): UpdateBuilderFiltered<T, OP, I, P, O, O2>;
    noMessages(): Builder<T & UpdateService<I, O>, OP>;
    apply(): Builder<T & UpdateServiceMessage<I, O, O>, OP>;
}

export interface UpdateBuilderFiltered<T, OP, I, P, O, F> {
    filter<O2>(filter: Filter<O, O2, AfterParams<I, P, O>>): UpdateBuilderFiltered<T, OP, I, P, O, O2>;
    apply(): Builder<T & UpdateServiceMessage<I, O, F>, OP>;
}

export interface PatchService<I, O> {
    patch(id: string, data: I): Promise<O>;
}

export interface PatchServiceMessage<I, O, F> extends PatchService<I, O> {
    on(message: 'patched', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface PatchBuilder<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): PatchBuilder<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): PatchBuilder<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): PatchBuilder<T, OP, I, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((id: string, data: void, params: P) => Promise<O>)): PatchBuilderAfter<T, OP, {}, P, O>;
    validateInput<I2, P2 extends Partial<P>>(hook: ValidateHook<I2, P2>): PatchBuilderValidated<T, OP, I2, P>;
}

export interface PatchBuilderValidated<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): PatchBuilderValidated<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): PatchBuilderValidated<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): PatchBuilderValidated<T, OP, I, P & P2 & P3 & P4>;
    validateInput<I2, P2 extends Partial<P>>(hook: ValidateHook<I2, P2>): PatchBuilderValidated<T, OP, I2, P>;
    method<O>(method: ((id: string, data: I, params: P) => Promise<O>)): PatchBuilderAfter<T, OP, I, P, O>;
}

export interface PatchBuilderAfter<T, OP, I, P, O> {
    after<P2, O2>(hook: AfterHook<void, P, P2, O, O2>): PatchBuilderAfter<T, OP, I, P2, O2>;
    filter<O2>(filter: Filter<O, O2, AfterParams<I, P, O>>): PatchBuilderFiltered<T, OP, I, P, O, O2>;
    noMessages(): Builder<T & PatchService<I, O>, OP>;
    apply(): Builder<T & PatchServiceMessage<I, O, O>, OP>;
}

export interface PatchBuilderFiltered<T, OP, I, P, O, F> {
    filter<O2>(filter: Filter<O, O2, AfterParams<I, P, O>>): PatchBuilderFiltered<T, OP, I, P, O, O2>;
    apply(): Builder<T & PatchServiceMessage<I, O, F>, OP>;
}

export interface RemoveService<O> {
    remove(id: string): Promise<O>;
}

export interface RemoveServiceMessage<O, F> extends RemoveService<O> {
    on(message: 'removed', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface RemoveBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): RemoveBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): RemoveBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): RemoveBuilder<T, OP, P & P2 & P3 & P4>;
    method<O>(method: ((id: string, params: P) => Promise<O>)): RemoveBuilderAfter<T, OP, P, O>;
}

export interface RemoveBuilderAfter<T, OP, P, O> {
    after<P2, O2>(hook: AfterHook<void, P, P2, O, O2>): RemoveBuilderAfter<T, OP, P2, O2>;
    filter<O2>(filter: Filter<O, O2, AfterParams<void, P, O>>): RemoveBuilderFiltered<T, OP, P, O, O2>;
    noMessages(): Builder<T & RemoveService<O>, OP>;
    apply(): Builder<T & RemoveServiceMessage<O, O>, OP>;
}

export interface RemoveBuilderFiltered<T, OP, P, O, F> {
    filter<O2>(filter: Filter<O, O2, AfterParams<void, P, O>>): RemoveBuilderFiltered<T, OP, P, O, O2>;
    apply(): Builder<T & RemoveServiceMessage<O, F>, OP>;
}

export interface CustomEvent<E extends string, I, O> {
    emit(method: E, data: I): void;
    on(method: E, callback: ((data: O) => Promise<void>), caller?: string): void;
}

export interface ServiceProps {
    readonly events: ReadonlyArray<string>;
    removeAllListeners(): void;
}

export interface CustomEventFilterBuilder<S, OE extends string, I, P, O> {
    customEventFilter<E extends string, T, T2>(event: E,
        filter: Filter<T, T2>): CustomEventFilterBuilder<S & CustomEvent<OE, I, O>, E, T, P, T2>;
    filter<O2>(filter: Filter<O, O2, AfterParams<void, P, O>>): CustomEventFilterBuilder<S, OE, I, P, O2>;
    customEventInternal<E extends string, T>(event: E): CustomEventInternalBuilder<S & CustomEvent<E, T, T>, P>;
    build(path: string, app: Application): ServiceProps & S & CustomEvent<OE, I, O>;
}

export interface CustomEventInternalBuilder<S, P> {
    customEventFilter<E extends string, T, T2>(event: E,
        filter: Filter<T, T2>): CustomEventFilterBuilder<S, E, T, P, T2>;
    customEventInternal<E extends string, T>(event: E): CustomEventInternalBuilder<S & CustomEvent<E, T, T>, P>;
    build(path: string, app: Application): ServiceProps & S;
}

export interface Builder<S, P> {
    beforeAll<P2>(hook: BeforeHook<P, P2>): Builder<S, P & P2>;
    find(): FindBuilder<S, P, P>;
    get(): GetBuilder<S, P, P>;
    create(): CreateBuilder<S, P, void, P>;
    update(): UpdateBuilder<S, P, void, P>;
    patch(): PatchBuilder<S, P, void, P>;
    remove(): RemoveBuilder<S, P, P>;
    // tslint:disable-next-line:no-any
    afterAll(hook: AfterHook<void, any, any, any, any>): this;
    customEventFilter<E extends string, T, T2>(event: E,
        filter: Filter<T, T2>): CustomEventFilterBuilder<S, E, T, P, T2>;
    customEventInternal<E extends string, T>(event: E): CustomEventInternalBuilder<S & CustomEvent<E, T, T>, P>;
    build(path: string, app: Application): ServiceProps & S;
}
