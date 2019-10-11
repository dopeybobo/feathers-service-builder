import { AfterContext, OutputHook } from 'feathers-service-builder';
import { User } from '../user';

export function toExternalUser(): OutputHook<User> {
    return function toExternalUser(hook: AfterContext<unknown, User>) {
        const { username, name } = hook.result;
        hook.result = { username, name };
        return hook;
    };
}
