import * as feathers from '@feathersjs/feathers';
import * as express from '@feathersjs/express';
import * as errors from '@feathersjs/errors';

import { BeforeContext, ServiceBuilder, ValidateHook } from 'feathers-service-builder';

// Configure Feathers application
const app = express(feathers());
app.use(express.json());
app.configure(express.rest());

// Build the test service
const items = new Map<string, string>();
new ServiceBuilder().newService()
    .get()
    .method(async id => {
        if (!items.has(id)) {
            throw new errors.NotFound();
        }
        return { message: items.get(id) };
    })
    .unformatted()
    .create()
    .validateInput(validateCreate())
    .method(async data => {
        items.set(data.id, data.message);
        return { message: data.message };
    })
    .unformatted()
    .silent()
    .remove()
    .method(async id => items.delete(id))
    .unformatted()
    .silent()
    .build('/test', app);

// Handle errors and start the app
app.use(express.errorHandler());
app.listen(8080);

// Validate that the create request is correctly formatted
interface CreateRequest {
    id: string;
    message: string;
}

function validateCreate(): ValidateHook<CreateRequest> {
    return (hook: BeforeContext<CreateRequest, void>): BeforeContext<CreateRequest, void> => {
        const { id, message } = hook.data;
        if (!id || !message || typeof id !== 'string' || typeof message !== 'string') {
            throw new errors.BadRequest('You must provide an id and message');
        }
        return hook;
    };
}
