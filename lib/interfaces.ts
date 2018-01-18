import { Application, Channel } from '@feathersjs/feathers';
import { AfterHook, AfterParams, BeforeHook, OutputHook, ValidateHook } from './hooks';

export type Filter<I, P> = (data: I, hook: AfterParams<void, P, I>) => Channel;

export interface FilteredBuilder<T, OP, P, O> {
    filter(filter: Filter<O, P>): Builder<T, OP>;
}

export interface MessageService<E extends string, O> {
    emit(method: E, data: O): void;
    on(message: E, callback: ((data: O) => Promise<void>), caller?: string): void;
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

export interface CreateBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): CreateBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): CreateBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): CreateBuilder<T, OP, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((data: void, params: P) => Promise<O>)): CreateBuilderAfter<T, OP, {}, P, O>;
    internalOnly<I, O>(method: ((data: I, params: P) => Promise<O>)): Builder<T & CreateService<I, O>, OP>;
    internalWithMessages<I, O>(method: ((data: I, params: P) => Promise<O>)): FilteredBuilder<T & CreateServiceMessage<I, O>, OP, P, O>;
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
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): FilteredBuilder<T & CreateServiceMessage<I, O2>, OP, P & P2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): FilteredBuilder<T & CreateServiceMessage<I, O3>, OP, P & P2 & P3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, I | void>): Builder<T & CreateService<I, O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, I | void>): Builder<T & CreateService<I, O3>, OP>;
}

export interface UpdateBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): UpdateBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): UpdateBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): UpdateBuilder<T, OP, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((id: string, data: void, params: P) => Promise<O>)): UpdateBuilderAfter<T, OP, {}, P, O>;
    internalOnly<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): Builder<T & UpdateService<I, O>, OP>;
    internalWithMessages<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): FilteredBuilder<T & UpdateServiceMessage<I, O>, OP, P, O>;
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
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): FilteredBuilder<T & UpdateServiceMessage<I, O2>, OP, P & P2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): FilteredBuilder<T & UpdateServiceMessage<I, O3>, OP, P & P2 & P3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, I | void>): Builder<T & UpdateService<I, O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, I | void>): Builder<T & UpdateService<I, O3>, OP>;
}

export interface PatchBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): PatchBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): PatchBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): PatchBuilder<T, OP, P & P2 & P3 & P4>;
    ignoresInput<O>(method: ((id: string, data: void, params: P) => Promise<O>)): PatchBuilderAfter<T, OP, {}, P, O>;
    internalOnly<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): Builder<T & PatchService<I, O>, OP>;
    internalWithMessages<I, O>(method: ((id: string, data: I, params: P) => Promise<O>)): FilteredBuilder<T & PatchServiceMessage<I, O>, OP, P, O>;
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
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>): FilteredBuilder<T & PatchServiceMessage<I, O2>, OP, P & P2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, I | void>): FilteredBuilder<T & PatchServiceMessage<I, O3>, OP, P & P2 & P3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, I | void>): Builder<T & PatchService<I, O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, I | void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, I | void>): Builder<T & PatchService<I, O3>, OP>;
}

export interface RemoveBuilder<T, OP, P> {
    before<P2>(hook: BeforeHook<P, P2>): RemoveBuilder<T, OP, P & P2>;
    before<P2, P3>(hook: BeforeHook<P, P2>,
        hook2: BeforeHook<P, P3>): RemoveBuilder<T, OP, P & P2 & P3>;
    before<P2, P3, P4>(hook: BeforeHook<P, P2>, hook2: BeforeHook<P, P3>,
        hook3: BeforeHook<P, P4>): RemoveBuilder<T, OP, P & P2 & P3 & P4>;
    internalOnly<O>(method: ((id: string, params: P) => Promise<O>)): Builder<T & RemoveService<O>, OP>;
    internalWithMessages<O>(method: ((id: string, params: P) => Promise<O>)): FilteredBuilder<T & RemoveServiceMessage<O>, OP, P, O>;
    method<O>(method: ((id: string, params: P) => Promise<O>)): RemoveBuilderAfter<T, OP, P, O>;
}

export interface RemoveBuilderAfter<T, OP, P, O> {
    after<P2>(hook: AfterHook<P, P2, O | void, void>): RemoveBuilderAfter<T, OP, P & P2, O>;
    after<P2, P3>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>): RemoveBuilderAfter<T, OP, P & P2 & P3, O>;
    after<P2, P3, P4>(hook: AfterHook<P, P2, O | void, void>,
        hook2: AfterHook<P, P3, O | void, void>,
        hook3: AfterHook<P, P4, O | void, void>): RemoveBuilderAfter<T, OP, P & P2 & P3 & P4, O>;
    convertOutput<P2, O2>(hook: OutputHook<Partial<P>, P2, O, O2, void>): FilteredBuilder<T & RemoveServiceMessage<O2>, OP, P & P2, O2>;
    convertOutput<P2, O2, P3, O3>(hook: OutputHook<Partial<P>, P2, O, O2, void>,
        hook2: OutputHook<Partial<P & P2>, P3, O2, O3, void>): FilteredBuilder<T & RemoveServiceMessage<O3>, OP, P & P2 & P3, O3>;
    convertOutputSilent<O2>(hook: OutputHook<Partial<P>, any, O, O2, void>): Builder<T & RemoveService<O2>, OP>;
    convertOutputSilent<P2, O2, O3>(hook: OutputHook<Partial<P>, P2, O, O2, void>,
        hook2: OutputHook<Partial<P & P2>, any, O2, O3, void>): Builder<T & RemoveService<O3>, OP>;
}

export interface ServiceProps {
    readonly events: ReadonlyArray<string>;
    removeAllListeners(): void;
}

export interface CustomEventBuilder<S> {
    customEventFilter<E extends string, T>(event: E,
        filter: Filter<T, void>): CustomEventBuilder<S & MessageService<E, T>>;
    customEventInternal<E extends string, T>(event: E): CustomEventBuilder<S & MessageService<E, T>>;
    build(path: string, app: Application): ServiceProps & S;
}

export interface Builder<S, P> extends CustomEventBuilder<S> {
    beforeAll<P2>(hook: BeforeHook<P, P2>): Builder<S, P & P2>;
    find(): FindBuilder<S, P, P>;
    get(): GetBuilder<S, P, P>;
    create(): CreateBuilder<S, P, P>;
    update(): UpdateBuilder<S, P, P>;
    patch(): PatchBuilder<S, P, P>;
    remove(): RemoveBuilder<S, P, P>;
    afterAll(hook: AfterHook<any, any, any, void>): this;
    build(path: string, app: Application): ServiceProps & S;
}
