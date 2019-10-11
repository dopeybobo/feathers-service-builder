import { BeforeContext, BeforeHook } from 'feathers-service-builder';
import * as errors from '@feathersjs/errors';

import { User } from '../user';

export type UsernameParams = { username: string };
export type RegisteredParams = { user: User };

export function validateUser(): BeforeHook<RegisteredParams, UsernameParams> {
    return async function validateUser(
        hook: BeforeContext<RegisteredParams & UsernameParams>): Promise<BeforeContext<RegisteredParams>> {
        const user = await hook.app.service('user').get(hook.params.username);
        if (!user) {
            throw new errors.Forbidden(`There is no user ${hook.params.username}`);
        }
        hook.params.user = user;
        return hook;
    };
}
