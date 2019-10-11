import { Application } from '@feathersjs/feathers';
import * as errors from '@feathersjs/errors';
import { ServiceBuilder } from 'feathers-service-builder';

import { ChatRequest, validateChatRequest } from './hooks/validate';

interface ChatMessage {
    from: string;
    message: string;
    isBot?: boolean;
}

export interface ChatService {
    create(data: ChatRequest): Promise<ChatMessage>;
    emit(method: 'created', data: ChatMessage): void;
    on(event: 'created', callback: ((data: ChatMessage) => (Promise<void> | void)),
        listener: string): void;
}

export function register(builder: ServiceBuilder, app: Application, path: string): ChatService {
    return builder.newService()
        .create()
        .validateInput(validateChatRequest())
        .method(async request => {
            const user = await app.service('user').get(request.username);
            if (!user) {
                throw new errors.Forbidden('User is not registered');
            }
            return { from: user.name, message: request.message };
        })
        .unformatted()
        .publishTo((_, hook) => hook.app.channel('active'))
        .build(path, app);
}
