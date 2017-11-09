import { Application } from 'feathers';
import { AfterHook, AfterParams, BeforeHook, OutputHook, ValidateHook } from './hooks';

export type Filter<I, O, H extends AfterParams<any, any, any> | void> =
    (data: I, connection: any, hook: H) => Promise<O | false> | O | false;

export interface FindService<O> {
    find(): Promise<O>;
}

export interface FindBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): FindBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): FindBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): FindBuilder<T, OP, P & P2 & P3 & P4>;
    internalOnly<O>(method: ((params: P) => Promise<O>)): Builder<T & FindService<O>, OP>;
    method<O>(method: ((params: P) => Promise<O>)): FindBuilderAfter<T, OP, P, O>;
}

export interface FindBuilderAfter<T, OP, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, void>): FindBuilderAfter<T, OP, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>): FindBuilderAfter<T, OP, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>,
        hook3: AfterHook<P, P4, O | void, void>): FindBuilderAfter<T, OP, P & P2 & P3 & P4, O>;
    convertOutput<O2>(hook: OutputHook<Partial<P>, any, O, O2, void>): Builder<T & FindService<O2>, OP>;
    convertOutput<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, void>): Builder<T & FindService<O3>, OP>;
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
    internalOnly<O>(method: ((id: string, params: P) => Promise<O>)): Builder<T & GetService<O>, OP>;
    method<O>(method: ((id: string, params: P) => Promise<O>)): GetBuilderAfter<T, OP, P, O>;
}

export interface GetBuilderAfter<T, OP, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, void>): GetBuilderAfter<T, OP, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>): GetBuilderAfter<T, OP, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>,
        hook3: AfterHook<P, P4, O | void, void>): GetBuilderAfter<T, OP, P & P2 & P3 & P4, O>;
    convertOutput<O2>(hook: OutputHook<Partial<P>, any, O, O2, void>): Builder<T & GetService<O2>, OP>;
    convertOutput<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, void>): Builder<T & GetService<O3>, OP>;
}

export interface CreateService<I, O> {
    create(data: I): Promise<O>;
}

export interface CreateServiceMessage<I, O, F> extends CreateService<I, O> {
    on(message: 'created', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface CreateBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): CreateBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): CreateBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): CreateBuilder<T, OP, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((data: void, params: P) => Promise<O>)): CreateBuilderAfter<T, OP, {}, P, O>;
    internalOnly<I, O>(method: ((data: I, params: P) => Promise<O>)): Builder<T & CreateService<I, O>, OP>;
    internalWithMessages<I, O>(method: ((data: I, params: P) => Promise<O>)): CreateBuilderFiltered<T, OP, I, P, O, O>;
    validateInput<I2>(hook: ValidateHook<I2, Partial<P>>): CreateBuilderValidated<T, OP, I2, P>;
}

export interface CreateBuilderValidated<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): CreateBuilderValidated<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): CreateBuilderValidated<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): CreateBuilderValidated<T, OP, I, P & P2 & P3 & P4>;
    validateInput<I2>(hook: ValidateHook<I2, Partial<P>>): CreateBuilderValidated<T, OP, I2, P>;
    method<O>(method: ((data: I, params: P) => Promise<O>)): CreateBuilderAfter<T, OP, I, P, O>;
}

export interface CreateBuilderAfter<T, OP, I, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, I | void>): CreateBuilderAfter<T, OP, I, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>): CreateBuilderAfter<T, OP, I, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>,
        hook3: AfterHook<P, P4, O | void, I | void>): CreateBuilderAfter<T, OP, I, P & P2 & P3 & P4, O>;
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): CreateBuilderFiltered<T, OP, I, P & P2, O2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): CreateBuilderFiltered<T, OP, I, P & P2 & P3, O3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, I | void>): Builder<T & CreateService<I, O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, I | void>): Builder<T & CreateService<I, O3>, OP>;
}

export interface CreateBuilderFiltered<T, OP, I, P, O, F> {
    chainFilter<O2>(filter: Filter<F, O2, AfterParams<I, P, O>>): CreateBuilderFiltered<T, OP, I, P, O, O2>;
    filter<O2>(filter: Filter<F, O2, AfterParams<I, P, O>>): Builder<T & CreateServiceMessage<I, O, O2>, OP>;
}

export interface UpdateService<I, O> {
    update(id: string, data: I): Promise<O>;
}

export interface UpdateServiceMessage<I, O, F> extends UpdateService<I, O> {
    on(message: 'updated', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface UpdateBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): UpdateBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): UpdateBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): UpdateBuilder<T, OP, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((id: string, data: void, params: P) => Promise<O>)): UpdateBuilderAfter<T, OP, {}, P, O>;
    internalOnly<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): Builder<T & UpdateService<I, O>, OP>;
    internalWithMessages<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): UpdateBuilderFiltered<T, OP, I, P, O, O>;
    validateInput<I2>(hook: ValidateHook<I2, Partial<P>>): UpdateBuilderValidated<T, OP, I2, P>;
}

export interface UpdateBuilderValidated<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): UpdateBuilderValidated<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): UpdateBuilderValidated<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): UpdateBuilderValidated<T, OP, I, P & P2 & P3 & P4>;
    validateInput<I2>(hook: ValidateHook<I2, Partial<P>>): UpdateBuilderValidated<T, OP, I2, P>;
    method<O>(method: ((id: string, data: I, params: P) => Promise<O>)): UpdateBuilderAfter<T, OP, I, P, O>;
}

export interface UpdateBuilderAfter<T, OP, I, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, I | void>): UpdateBuilderAfter<T, OP, I, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>): UpdateBuilderAfter<T, OP, I, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>,
        hook3: AfterHook<P, P4, O | void, I | void>): UpdateBuilderAfter<T, OP, I, P & P2 & P3 & P4, O>;
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): UpdateBuilderFiltered<T, OP, I, P & P2, O2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): UpdateBuilderFiltered<T, OP, I, P & P2 & P3, O3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, I | void>): Builder<T & UpdateService<I, O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, I | void>): Builder<T & UpdateService<I, O3>, OP>;
}

export interface UpdateBuilderFiltered<T, OP, I, P, O, F> {
    chainFilter<O2>(filter: Filter<F, O2, AfterParams<I, P, O>>): UpdateBuilderFiltered<T, OP, I, P, O, O2>;
    filter<O2>(filter: Filter<F, O2, AfterParams<I, P, O>>): Builder<T & UpdateServiceMessage<I, O, O2>, OP>;
}

export interface PatchService<I, O> {
    patch(id: string, data: I): Promise<O>;
}

export interface PatchServiceMessage<I, O, F> extends PatchService<I, O> {
    on(message: 'patched', callback: ((data: F) => Promise<void>), caller?: string): void;
}

export interface PatchBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): PatchBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): PatchBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): PatchBuilder<T, OP, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((id: string, data: void, params: P) => Promise<O>)): PatchBuilderAfter<T, OP, {}, P, O>;
    internalOnly<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): Builder<T & PatchService<I, O>, OP>;
    internalWithMessages<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): PatchBuilderFiltered<T, OP, I, P, O, O>;
    validateInput<I2>(hook: ValidateHook<I2, Partial<P>>): PatchBuilderValidated<T, OP, I2, P>;
}

export interface PatchBuilderValidated<T, OP, I, P> {
    before<P2>(hook: BeforeHook<P, P2>): PatchBuilderValidated<T, OP, I, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): PatchBuilderValidated<T, OP, I, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): PatchBuilderValidated<T, OP, I, P & P2 & P3 & P4>;
    validateInput<I2>(hook: ValidateHook<I2, Partial<P>>): PatchBuilderValidated<T, OP, I2, P>;
    method<O>(method: ((id: string, data: I, params: P) => Promise<O>)): PatchBuilderAfter<T, OP, I, P, O>;
}

export interface PatchBuilderAfter<T, OP, I, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, I | void>): PatchBuilderAfter<T, OP, I, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>): PatchBuilderAfter<T, OP, I, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, I | void>,
        hook2: AfterHook<P, P3, O | void, I | void>,
        hook3: AfterHook<P, P4, O | void, I | void>): PatchBuilderAfter<T, OP, I, P & P2 & P3 & P4, O>;
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): PatchBuilderFiltered<T, OP, I, P & P2, O2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): PatchBuilderFiltered<T, OP, I, P & P2 & P3, O3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, I | void>): Builder<T & PatchService<I, O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, I | void>): Builder<T & PatchService<I, O3>, OP>;
}

export interface PatchBuilderFiltered<T, OP, I, P, O, F> {
    chainFilter<O2>(filter: Filter<F, O2, AfterParams<I, P, O>>): PatchBuilderFiltered<T, OP, I, P, O, O2>;
    filter<O2>(filter: Filter<F, O2, AfterParams<I, P, O>>): Builder<T & PatchServiceMessage<I, O, O2>, OP>;
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
    internalOnly<O>(method: ((id: string, params: P) => Promise<O>)): Builder<T & RemoveService<O>, OP>;
    internalWithMessages<O>(method: ((id: string, params: P) => Promise<O>)): RemoveBuilderFiltered<T, OP, P, O, O>;
    method<O>(method: ((id: string, params: P) => Promise<O>)): RemoveBuilderAfter<T, OP, P, O>;
}

export interface RemoveBuilderAfter<T, OP, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, void>): RemoveBuilderAfter<T, OP, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>): RemoveBuilderAfter<T, OP, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>,
        hook3: AfterHook<P, P4, O | void, void>): RemoveBuilderAfter<T, OP, P & P2 & P3 & P4, O>;
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, void>): RemoveBuilderFiltered<T, OP, P & P2, O2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, void>): RemoveBuilderFiltered<T, OP, P & P2 & P3, O3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, void>): Builder<T & RemoveService<O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, void>): Builder<T & RemoveService<O3>, OP>;
}

export interface RemoveBuilderFiltered<T, OP, P, O, F> {
    chainFilter<O2>(filter: Filter<F, O2, AfterParams<void, P, O>>): RemoveBuilderFiltered<T, OP, P, O, O2>;
    filter<O2>(filter: Filter<F, O2, AfterParams<void, P, O>>): Builder<T & RemoveServiceMessage<O, O2>, OP>;
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
        filter: Filter<T, T2, void>): CustomEventFilterBuilder<S & CustomEvent<OE, I, O>, E, T, P, T2>;
    filter<O2>(filter: Filter<O, O2, AfterParams<void, P, O>>): CustomEventFilterBuilder<S, OE, I, P, O2>;
    customEventInternal<E extends string, T>(event: E): CustomEventInternalBuilder<S & CustomEvent<E, T, T>, P>;
    build(path: string, app: Application): ServiceProps & S & CustomEvent<OE, I, O>;
}

export interface CustomEventInternalBuilder<S, P> {
    customEventFilter<E extends string, T, T2>(event: E,
        filter: Filter<T, T2, void>): CustomEventFilterBuilder<S, E, T, P, T2>;
    customEventInternal<E extends string, T>(event: E): CustomEventInternalBuilder<S & CustomEvent<E, T, T>, P>;
    build(path: string, app: Application): ServiceProps & S;
}

export interface Builder<S, P> {
    beforeAll<P2>(hook: BeforeHook<P, P2>): Builder<S, P & P2>;
    find(): FindBuilder<S, P, P>;
    get(): GetBuilder<S, P, P>;
    create(): CreateBuilder<S, P, P>;
    update(): UpdateBuilder<S, P, P>;
    patch(): PatchBuilder<S, P, P>;
    remove(): RemoveBuilder<S, P, P>;
    afterAll(hook: AfterHook<any, any, any, void>): this;
    customEventFilter<E extends string, T, T2>(event: E,
        filter: Filter<T, T2, void>): CustomEventFilterBuilder<S, E, T, P, T2>;
    customEventInternal<E extends string, T>(event: E): CustomEventInternalBuilder<S & CustomEvent<E, T, T>, P>;
    build(path: string, app: Application): ServiceProps & S;
}
