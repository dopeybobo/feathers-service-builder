import { Application } from '@feathersjs/feathers';
import { HookContext, ServiceLogger } from 'feathers-service-builder';

/**
 * A simple logger that prints relevant information to the console when hooks run, methods are
 * called, and service events are handled within the app.
 */
export class Logger implements ServiceLogger {
    logEvent(_app: Application, event: string, service: string, start: Date, duration: number,
        listener: string): void {
        const time = start.toLocaleTimeString();
        console.log(`[${time}]: ${listener} responded to '${service} ${event}' (${duration.toFixed(2)}ms)`);
    }

    async logHook(hook: HookContext, name: string, start: Date,
        duration: number, parallel?: Promise<number>): Promise<void> {
        const all = parallel ? ` - Shared ${(await parallel).toFixed(2)}ms` : '';
        const time = start.toLocaleTimeString();
        const caller = `${hook.path}.${hook.method}`;
        console.log(`[${time}]: ${hook.type} hook ${name} ran for ${caller} (${duration.toFixed(2)}ms${all})`);
    }

    logMethod(_app: Application, _hook: unknown, service: string, method: string, start: Date,
        duration: number, withHooks?: number): void {
        const hookDuration = withHooks ? ` - Total ${withHooks.toFixed(2)}ms` : '';
        const time = start.toLocaleTimeString();
        console.log(`[${time}]: Called ${service}.${method} (${duration.toFixed(2)}ms${hookDuration})`);
    }
}
