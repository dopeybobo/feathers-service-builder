# Example chat application

This is a simple application that gives you a chat room that supports some simple bots. Users can
create simple bots that will look for messages with a provided trigger message. When the bot
receives such a message, it will replace the trigger text with a replacement text and send its own
chat message.

This application is intentionally insecure (anyone can pretend to be any existing user, for example)
in order to keep the example simple and to provide opportunities to explore improvements.

## Usage

To install the application dependencies:

`npm install`

To build the application:

`npm run build`

To run the application:

`npm run start`

Once started, you can connect to the application by pointing your browser to http://localhost:8080/.

## Exploration Ideas

There are several improvements that can be done that are left as exercises for those wanting to
learn more.

 - Add proper authentication with `@feathersjs/authentication`
([docs](https://docs.feathersjs.com/api/authentication/server.html) |
 [source](https://github.com/feathersjs/authentication))
 - Store users and bots in a database
[docs](https://docs.feathersjs.com/api/databases/adapters.html)
 - Show a list of active users
 - Show a list of active bots
 - Add chat rooms
