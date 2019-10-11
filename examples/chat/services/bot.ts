import { Application } from '@feathersjs/feathers';
import { ServiceBuilder } from 'feathers-service-builder';

import { hasTextData } from './hooks/validate';

interface Bot {
    name: string;
}

interface BotRequest {
    name: string;
    trigger: string;
    replacement: string;
}

/**
 * A simple service for creating and deleting bots. Bots listen for a `trigger` in chat messages and
 * when they see one, they post their own chat message with the same message, but with `trigger`
 * replaced with `replacement`.
 */
export interface BotService {
    create(data: BotRequest): Promise<Bot>;
    remove(name: string): Promise<void>;
}

export function register(builder: ServiceBuilder, app: Application, path: string): BotService {
    const service = new Service();
    return builder.newService(service)
        .create()
        .validateInput(hasTextData('name'), hasTextData('trigger'), hasTextData('replacement'))
        .method(async data => {
            service.bots.set(data.name, data);
            return data;
        })
        .format(result => ({ name: result.name }))
        .silent()
        .remove()
        .method(async name => { service.bots.delete(name); })
        .unformatted()
        .silent()
        .build(path, app);
}

class Service {
    bots = new Map<string, BotRequest>();

    setup(app: Application): void {
        const chatService = app.service('chat');
        chatService.on('created', chat => {
            if (chat.isBot) {
                return;
            }
            for (const [name, bot] of this.bots) {
                if (chat.message.indexOf(bot.trigger) !== -1) {
                    const message = chat.message.replace(bot.trigger, bot.replacement);
                    chatService.emit('created', { message, from: name, isBot: true });
                }
            }
        }, 'bot');
    }
}
