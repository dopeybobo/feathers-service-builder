import * as errors from '@feathersjs/errors';
import { BeforeContext, ValidateHook } from 'feathers-service-builder';

// We can validate input requests in ValidateHooks to make sure we sanitize our user-provided
// inputs. We assign a new object with only the validated fields to hook.data to ensure that there
// are no extra fields that might get passed along in the method.

export interface ChatRequest {
    username: string;
    message: string;
}

export function validateChatRequest(): ValidateHook<ChatRequest> {
    // NOTE: The inner function needs a name so the logger can identify it
    return function validateChatRequest(
        hook: BeforeContext<unknown, ChatRequest>): BeforeContext<unknown, ChatRequest> {
        const { username, message } = hook.data;
        if (!message || typeof message !== 'string') {
            throw new errors.BadRequest('You must provide a message');
        }
        if (!username || typeof username !== 'string') {
            throw new errors.BadRequest('You must provide a username');
        }
        hook.data = { username, message };
        return hook;
    };
}

export interface UserRequest {
    username: string;
    name: string;
}

export function validateUserRequest(): ValidateHook<UserRequest> {
    return function validateUserRequest(
        hook: BeforeContext<unknown, UserRequest>): BeforeContext<unknown, UserRequest> {
        const { username, name } = hook.data;
        if (!name || typeof name !== 'string' || !name.length) {
            throw new errors.BadRequest('You must provide a message');
        }
        if (!username || typeof username !== 'string' || !username.length) {
            throw new errors.BadRequest('You must provide a username');
        }
        hook.data = { username, name };
        return hook;
    };
}

// Alternatively, we can validate fields one at a time and compose them together to validate our
// input object. See services/bot.ts for an example.
// NOTE: This doesn't remove potential extra fields from the user input.

export function hasTextData<T extends string>(field: T): ValidateHook<{ [X in T]: string }>;
export function hasTextData<T extends string>(field: T,
    optional: true): ValidateHook<{ [X in T]?: string }>;
export function hasTextData<T extends string>(field: T, optional?: boolean) {
    return function hasTextData(
        hook: BeforeContext<unknown, { [X in T]: string }>): BeforeContext<unknown, { [X in T]: string }> {
        const value = hook.data[field];
        if (!optional && !value) {
            throw new errors.BadRequest(`${field} is required`);
        }
        if (value && typeof value !== 'string') {
            throw new errors.BadRequest(`${field} is not valid`);
        }
        return hook;
    };
}
