import { Application, Params } from '@feathersjs/feathers';
import { disallow } from 'feathers-hooks-common';
import { HookParams } from './hooks';
import { Builder } from './interfaces';

export { Filter } from './interfaces';
export { AfterHook, AfterParams, BeforeHook, BeforeParams, HookParams, OutputHook,
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
    logEvent?(app: Application, event: string, service: string, duration: number,
        listener?: string): void;

    /**
     * Called to log the execution duration of the provided hook. If the hook was called with
     * others in parallel, the duration of the entire parallel hook is also provided.
     *
     * Durations are provided in milliseconds.
     */
    logHook?(hook: HookParams<{}, Params>, name: string, duration: number,
        parallel?: Promise<number>): void;

    /**
     * Called to log the execution duration of the provided method. If the method was called
     * externally, the duration including all hooks is also provided.
     *
     * NOTE: Feathers does not run hooks on methods that are called internally.
     *
     * Durations are provided in milliseconds.
     */
    logMethod?(app: Application, hook: Params, service: string, method: string, duration: number,
        withHooks?: number): void;
}

type LoggedHook<I, P> = (hook: HookParams<I, P>) => Promise<HookParams<I, P>>;

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
                hook.params._start = process.hrtime();
                return Promise.resolve(hook);
            }];
            hooks.after.all = [hook => {
                const [seconds, nano] = process.hrtime(hook.params._start);
                const ms = seconds * 1000 + nano / 1000000;
                logger.logMethod(hook.app, hook.params, `/${hook.path}`, hook.method,
                    hook.params._duration, ms);
                return Promise.resolve(hook);
            }];
        }
        const filters = {};
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
            validateInput: hook => builder.before(hook),
            method: method => {
                if (this._logger && this._logger.logMethod) {
                    const logger = this._logger;
                    const current = currentMethod;
                    const logged = function(this: any, ...args) {
                        const start = process.hrtime();
                        const result = method.apply(this, args);
                        const params = args[args.length - 2];
                        result.then(() => {
                            const [seconds, nano] = process.hrtime(start);
                            const ms = seconds * 1000 + nano / 1000000;
                            if (!params._start) {
                                logger.logMethod(builtApp, params, builtPath, current, ms);
                            } else {
                                params._duration = ms;
                            }
                        });
                        return result;
                    };
                    service[currentMethod] = logged;
                } else {
                    service[currentMethod] = method;
                }
                return builder;
            },
            internalOnly: method => builder.internalWithMessages(method),
            internalWithMessages: method => {
                hooks.before[currentMethod] = hooks.before[currentMethod] || [];
                hooks.before[currentMethod].shift(disallow('external'));
                return builder.method(method);
            },
            filter: filter => {
                filters[currentEvent] = filter;
                return builder;
            },
            customEventFilter: (event, filter) => {
                currentEvent = event;
                service.events.push(event);
                return builder.filter(filter);
            },
            customEventInternal: event => {
                service.events.push(event);
                return builder;
            },
            convertOutput: (...outputHooks) => {
                hooks.after[currentMethod] = hooks.after[currentMethod] || [];
                outputHooks.forEach(hook =>
                    hooks.after[currentMethod].push(logHook(hook, this._logger)));
                return builder;
            },
            convertOutputSilent: (...outputHooks) => builder.convertOutput(...outputHooks),
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
                Object.keys(filters).forEach(key => built.publish(key, filters[key]));
                builtApp = app;
                builtPath = path;
                if (this._logger && this._logger.logEvent) {
                    const logger = this._logger;
                    const originalOn = built.on;
                    built.on = (event, callback, caller) => {
                        const logged = data => {
                            const start = process.hrtime();
                            const result = Promise.resolve(callback.call(built, data));
                            result.then(() => {
                                const [seconds, nano] = process.hrtime(start);
                                const ms = seconds * 1000 + nano / 1000000;
                                    logger.logEvent(app, event, path, ms, caller);
                            });
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
    return function parallel(data) {
        if (logger) {
            let resolve: ((val: number) => void);
            const promise: Promise<number> = new Promise(r => resolve = r);
            const start = process.hrtime();
            return Promise.all(hooks.map(hook => logHook(hook, logger, promise)(data)))
                .then(() => {
                    const [seconds, nano] = process.hrtime(start);
                    const ms = seconds * 1000 + nano / 1000000;
                    resolve(ms);
                    return data;
                });
        }
        return Promise.all(hooks.map(hook => hook(data)))
            .then(() => data);
    };
}

function logHook<I, P extends Params>(hook: LoggedHook<I, P>, logger?: ServiceLogger,
    parallel?: Promise<number>): LoggedHook<I, P> {
    if (logger && logger.logHook) {
        return (actual: HookParams<I, P>) => {
            const start = process.hrtime();
            const result = hook(actual);
            Promise.resolve(result)
                .then(newHook => {
                    const [seconds, nano] = process.hrtime(start);
                    const ms = seconds * 1000 + nano / 1000000;
                    if (newHook) {
                        logger.logHook(newHook, hook.name || 'unknown', ms, parallel);
                    }
                });
            return result;
        };
    }
    return hook;
}
