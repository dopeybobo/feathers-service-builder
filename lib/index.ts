import { Application, Params } from 'feathers';
import { AnyParams } from './hooks';
import { Builder } from './interfaces';

export interface ServiceLogger {
    /**
     * Called to log the execution duration of event processing. Duration is provided in
     * milliseconds. If the .on() event handler is called with a third parameter, it is provided
     * here as the listener parameter to distinguish between different handlers for the same event.
     */
    logEvent?(app: Application, event: string, service: string, duration: number,
        listener?: string): void;

    /**
     * Called to log the execution duration of the provided hook. If the hook was called with
     * others in parallel, the duration of the entire parallel hook is also provided.
     *
     * Durations are provided in milliseconds.
     */
    logHook?(hook: AnyParams<{}, Params>, duration: number, parallel?: Promise<number>): void;

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

type LoggedHook<I, P> = (hook: AnyParams<I, P>) => Promise<AnyParams<I, P>>;

function logHook<I, P extends Params>(hook: LoggedHook<I, P>, parallel?: Promise<number>): LoggedHook<I, P> {
    if (_logger && _logger.logHook) {
        return (actual: AnyParams<I, P>) => {
            const start = process.hrtime();
            const result = hook(actual);
            Promise.resolve(result)
                .then(newHook => {
                    const [seconds, nano] = process.hrtime(start);
                    const ms = seconds * 1000 + nano / 1000000;
                    if (newHook) {
                        _logger.logHook(newHook, ms, parallel);
                    }
                });
            return result;
        };
    }
    return hook;
}

function runParallel(...args) {
    return function parallel(data) {
        if (_logger) {
            let resolve: ((val: number) => void);
            const promise: Promise<number> = new Promise(r => resolve = r);
            const start = process.hrtime();
            return Promise.all(args.map(hook => logHook(hook, promise)(data)))
                .then(() => {
                    const [seconds, nano] = process.hrtime(start);
                    const ms = seconds * 1000 + nano / 1000000;
                    resolve(ms);
                    return data;
                });
        }
        return Promise.all(args.map(hook => hook(data)));
    };
}

let _logger: ServiceLogger;

export function setLogger(logger: ServiceLogger): void {
    _logger = logger;
}

// tslint:disable:no-any
export function buildService<T extends Object>(base?: T): Builder<T, Params> {
    const service = Object.assign(base || {}, { events: [] });
    let hooks: any = { before: {}, after: {} };
    if (_logger && _logger.logMethod) {
        hooks.before.all = [hook => {
            hook.params._start = process.hrtime();
            return Promise.resolve(hook);
        }];
        hooks.after.all = [hook => {
            const [seconds, nano] = process.hrtime(hook.params._start);
            const ms = seconds * 1000 + nano / 1000000;
            _logger.logMethod(hook.app, hook.params, `/${hook.path}`, hook.method,
                hook.params.duration, ms);
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
            hooks.before.all.push(logHook(hook));
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
                hooks.before[currentMethod].push(runParallel(beforeHooks));
            } else {
                hooks.before[currentMethod].push(logHook(beforeHooks[0]));
            }
            return builder;
        },
        ignoresInput: method => builder.method(method),
        validateInput: hook => builder.before(hook),
        method: method => {
            if (_logger && _logger.logMethod) {
                const current = currentMethod;
                const logged = function(this: any, ...args) {
                    const start = process.hrtime();
                    const result = method.apply(this, args);
                    const params = args[args.length - 2];
                    result.then(() => {
                        const [seconds, nano] = process.hrtime(start);
                        const ms = seconds * 1000 + nano / 1000000;
                        if (!params.provider || !params._start) {
                            _logger.logMethod(builtApp, params, builtPath, current, ms);
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
        filter: filter => {
            filters[currentEvent] = filters[currentEvent] || [];
            filters[currentEvent].push(filter);
            return builder;
        },
        customEventFilter: (event, filter) => {
            currentEvent = event;
            service.events.push(event);
            return builder.filter(filter);
        },
        customEventInternal: event => {
            service.events.push(event);
            filters[event] = [() => false];
            return builder;
        },
        noMessages: () => {
            filters[currentEvent] = [() => false];
            return builder;
        },
        after: (...afterHooks) => {
            hooks.after[currentMethod] = hooks.after[currentMethod] || [];
            if (afterHooks.length > 1) {
                hooks.after[currentMethod].push(runParallel(afterHooks));
            } else {
                hooks.after[currentMethod].push(logHook(afterHooks[0]));
            }
            return builder;
        },
        apply: () => builder,
        afterAll: hook => {
            hooks.after.all = hooks.after.all || [];
            hooks.after.all.push(logHook(hook));
            return builder;
        },
        build: (path: string, app: Application) => {
            // tslint:disable-next-line:no-any
            app.use(path, <any>service);
            const built: any = app.service(path);
            built.hooks(hooks);
            built.filter(filters);
            builtApp = app;
            builtPath = path;
            if (_logger && _logger.logEvent) {
                const originalOn = built.on;
                built.on = (event, callback, caller) => {
                    const logged = data => {
                        const start = process.hrtime();
                        const result = Promise.resolve(callback.call(built, data));
                        result.then(() => {
                            const [seconds, nano] = process.hrtime(start);
                            const ms = seconds * 1000 + nano / 1000000;
                                _logger.logEvent(app, event, path, ms, caller);
                        });
                        return result;
                    };
                    return originalOn.call(built, event, logged);
                };
                return built;
            }
        }
    };
    return builder;
}
