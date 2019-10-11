import * as feathers from '@feathersjs/feathers';
import * as express from '@feathersjs/express';
import * as socketio from '@feathersjs/socketio'

import { registerServices } from './services';

// Configure Feathers application
const app = express(feathers());
app.use(express.json());
app.use('/', express.static('public'));
app.configure(express.rest());
app.configure(socketio())

registerServices(app);

app.use(express.errorHandler());
app.listen(8080);
