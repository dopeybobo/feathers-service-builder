import { Application, Params } from '@feathersjs/feathers';
import { disallow } from 'feathers-hooks-common';

import { HookContext } from './hooks';
import { Builder } from './interfaces';

export { Channel, Connection, MappedPublisher, Publisher, TypedChannel } from './interfaces';
export { AfterContext, AfterHook, BeforeContext, BeforeHook, HookContext, OutputHook,
    ValidateHook } from './hooks';

export interface ServiceLogger {
    /**
     * Called to log the execution duration of event processing. Duration is provided in
     * milliseconds.
     *
     * NOTE: Events are only logged when the .on() event handler is called with a third parameter,
     * which is provided here as listener to distinguish between different handlers for the same
     * event.
     */
    logEvent?(app: Application, event: string, service: string, start: Date, duration: number,
        listener?: string): void;

    /**
     * Called to log the execution duration of the provided hook. If the hook was called with
     * others in parallel, the duration of the entire parallel hook is also provided.
     *
     * Durations are provided in milliseconds.
     */
    logHook?(hook: HookContext<Params>, name: string, start: Date, duration: number,
        parallel?: Promise<number>): void;

    /**
     * Called to log the execution duration of the provided method. If the method was called
     * externally, the duration including all hooks is also provided.
     *
     * NOTE: Feathers does not run hooks on methods that are called internally.
     *
     * Durations are provided in milliseconds.
     */
    logMethod?(app: Application, hookParams: Params, service: string, method: string, start: Date,
        duration: number, withHooks?: number): void;
}

type LoggedHook<P, I> = (hook: HookContext<P, I>) => Promise<HookContext<P, I>>;

let _globalLogger: ServiceLogger;

export class ServiceBuilder {
    _logger: ServiceLogger;

    constructor(logger?: ServiceLogger) {
        this._logger = logger || _globalLogger;
    }

    newService<T extends Object>(base?: T): Builder<T, Params> {
        const service = Object.assign(base || {}, { events: [] });
        let hooks: any = { before: {}, after: {} };
        if (this._logger && this._logger.logMethod) {
            const logger = this._logger;
            hooks.before.all = [hook => {
                hook.params._startTime = new Date();
                hook.params._start = process.hrtime();
                return Promise.resolve(hook);
            }];
            hooks.after.all = [hook => {
                const [seconds, nano] = process.hrtime(hook.params._start);
                const ms = seconds * 1000 + nano / 1000000;
                logger.logMethod(hook.app, hook.params, `/${hook.path}`, hook.method,
                    hook.params._startTime, hook.params._duration, ms);
                return Promise.resolve(hook);
            }];
        }
        const publishers = {};
        let currentEvent: string;
        let currentMethod: string;
        let builtApp: Application;
        let builtPath: string;
        const setMethod: ((method: string, event?: string) => () => any) =
            (method: string, event?: string) => () => {
                currentMethod = method;
                currentEvent = event;
                return builder;
            };
        const builder = {
            beforeAll: hook => {
                hooks.before.all = hooks.before.all || [];
                hooks.before.all.push(logHook(hook, this._logger));
                return builder;
            },
            find: setMethod('find'),
            get: setMethod('get'),
            create: setMethod('create', 'created'),
            update: setMethod('update', 'updated'),
            patch: setMethod('patch', 'patched'),
            remove: setMethod('remove', 'removed'),
            before: (...beforeHooks) => {
                hooks.before[currentMethod] = hooks.before[currentMethod] || [];
                if (beforeHooks.length > 1) {
                    hooks.before[currentMethod].push(runParallel(this._logger, beforeHooks));
                } else {
                    hooks.before[currentMethod].push(logHook(beforeHooks[0], this._logger));
                }
                return builder;
            },
            ignoresInput: method => builder.method(method),
            validateInput: (...hooks) => builder.before(...hooks),
            method: method => {
                if (this._logger && this._logger.logMethod) {
                    const logger = this._logger;
                    const current = currentMethod;
                    const logged = async function(this: any, ...args) {
                        const startTime = new Date();
                        const start = process.hrtime();
                        const result = await method.apply(this, args);
                        const params = args[args.length - 1];
                        const [seconds, nano] = process.hrtime(start);
                        const ms = seconds * 1000 + nano / 1000000;
                        if (!params._start) {
                            logger.logMethod(builtApp, params, builtPath, current, startTime, ms);
                        } else {
                            params._duration = ms;
                        }
                        return result;
                    };
                    service[currentMethod] = logged;
                } else {
                    service[currentMethod] = method;
                }
                return builder;
            },
            internalOnly: method => builder.internalPublished(method),
            internalPublished: method => {
                hooks.before[currentMethod] = hooks.before[currentMethod] || [];
                hooks.before[currentMethod].unshift(disallow('external'));
                return builder.method(method);
            },
            publishTo: publisher => {
                publishers[currentEvent] = publisher;
                return builder;
            },
            customEventMapped: (event, publisher) => builder.customEventPublisher(event, publisher),
            customEventPublisher: (event, publisher) => {
                currentEvent = event;
                service.events.push(event);
                return builder.publishTo(publisher);
            },
            customEventInternal: () => builder,
            format: formatter => {
                const formatHook = hook => {
                    hook.result = formatter(hook.result);
                    return Promise.resolve(hook);
                };
                return builder.formatHook(formatHook);
            },
            formatHook: (...outputHooks) => {
                hooks.after[currentMethod] = hooks.after[currentMethod] || [];
                outputHooks.forEach(hook =>
                    hooks.after[currentMethod].push(logHook(hook, this._logger)));
                return builder;
            },
            silent: () => builder,
            unformatted: () => builder,
            after: (...afterHooks) => {
                hooks.after[currentMethod] = hooks.after[currentMethod] || [];
                if (afterHooks.length > 1) {
                    hooks.after[currentMethod].push(runParallel(this._logger, afterHooks));
                } else {
                    hooks.after[currentMethod].push(logHook(afterHooks[0], this._logger));
                }
                return builder;
            },
            afterAll: hook => {
                hooks.after.all = hooks.after.all || [];
                hooks.after.all.push(logHook(hook, this._logger));
                return builder;
            },
            build: (path: string, app: Application) => {
                app.use(path, <any>service);
                const built: any = app.service(path);
                built.hooks(hooks);
                Object.keys(publishers).forEach(key => built.publish(key, publishers[key]));
                builtApp = app;
                builtPath = path;
                if (this._logger && this._logger.logEvent) {
                    const logger = this._logger;
                    const originalOn = built.on;
                    built.on = (event, callback, caller) => {
                        const logged = async data => {
                            const startTime = new Date();
                            const start = process.hrtime();
                            const result = await callback.call(built, data);
                            const [seconds, nano] = process.hrtime(start);
                            const ms = seconds * 1000 + nano / 1000000;
                                logger.logEvent(app, event, path, startTime, ms, caller);
                            return result;
                        };
                        return originalOn.call(built, event, caller ? logged : callback);
                    };
                }
                return built;
            }
        };
        return builder;
    }

    static setGlobalLogger(logger: ServiceLogger): void {
        _globalLogger = logger;
    }
}

function runParallel(logger: ServiceLogger, hooks: any[]) {
    return async function parallel(data) {
        if (logger) {
            let resolve: ((val: number) => void);
            const promise: Promise<number> = new Promise(r => resolve = r);
            const start = process.hrtime();
            await Promise.all(hooks.map(hook => logHook(hook, logger, promise)(data)));

            const [seconds, nano] = process.hrtime(start);
            const ms = seconds * 1000 + nano / 1000000;
            resolve(ms);
            return data;
        }
        await Promise.all(hooks.map(hook => hook(data)));
        return data;
    };
}

function logHook<P, I>(hook: LoggedHook<P, I>, logger?: ServiceLogger,
    parallel?: Promise<number>): LoggedHook<P, I> {
    if (logger && logger.logHook) {
        return (actual: HookContext<P, I>) => {
            const startTime = new Date();
            const start = process.hrtime();
            const result = hook(actual);
            Promise.resolve(result)
                .then(newHook => {
                    const [seconds, nano] = process.hrtime(start);
                    const ms = seconds * 1000 + nano / 1000000;
                    if (newHook) {
                        logger.logHook(newHook, hook.name || 'unknown', startTime, ms, parallel);
                    }
                });
            return result;
        };
    }
    return hook;
}
