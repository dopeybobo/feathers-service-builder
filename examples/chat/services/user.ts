import { Application } from '@feathersjs/feathers';
import * as errors from '@feathersjs/errors';
import { ServiceBuilder } from 'feathers-service-builder';

import { UserRequest, validateUserRequest } from './hooks/validate';
import { toExternalUser } from './hooks/output';

export interface User {
    username: string;
    name: string;
}

/**
 * A simple service for creating and retrieving users. Uses an in-memory map, so users will not
 * persist between executions.
 */
export interface UserService {
    get(username: string): Promise<User>;
    create(data: UserRequest): Promise<User>;
    on(event: 'created', callback: ((data: UserRequest) => (Promise<void> | void)),
        listener: string): void;
}

export function register(builder: ServiceBuilder, app: Application, path: string): UserService {
    const users = new Map<string, User>();
    return builder.newService()
        .get()
        .method(async id => {
            if (!users.has(id)) {
                throw new errors.NotFound();
            }
            return users.get(id);
        })
        // We can use a hook to format output
        .formatHook(toExternalUser())
        .create()
        .validateInput(validateUserRequest())
        .method(async data => {
            // Pretend the stored user has extra fields like a database might assign
            const user = { _id: 'gobbledygook', __v: 0, username: data.username, name: data.name };
            users.set(data.username, user);
            return user;
        })
        // We can also just use a simple method to format the output
        .format(result => ({ username: result.username, name: result.name }))
        .publishTo((_, hook) => hook.app.channel('active'))
        .build(path, app);
}
