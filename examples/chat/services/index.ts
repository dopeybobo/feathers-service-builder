import { Application } from '@feathersjs/feathers';
import { ServiceBuilder } from 'feathers-service-builder';

import { Logger } from './logger';

import * as BotService from './bot';
import * as ChatService from './chat';
import * as UserService from './user';

export function registerServices(app: Application): void {
    const builder = new ServiceBuilder(new Logger());
    app.on('connection', connection => app.channel('active').join(connection));

    BotService.register(builder, app, '/bot');
    ChatService.register(builder, app, '/chat');
    UserService.register(builder, app, '/user');
}
