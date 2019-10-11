import * as feathers from '@feathersjs/feathers';
import { Channel, Connection } from 'feathers-service-builder';

import { BotService } from './bot';
import { ChatService } from './chat';
import { UserService } from './user';

interface ServiceMap {
    'bot': BotService;
    'chat': ChatService;
    'user': UserService;
}

declare module '@feathersjs/feathers' {
    export interface Application {
        channel(name: string): Channel;
        on(event: 'connection', callback: ((connection: Connection) => void)): void;
        service<K extends keyof ServiceMap>(serviceName: K): ServiceMap[K];
    }
}
