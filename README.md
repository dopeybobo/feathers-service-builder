# feathers-service-builder
A TypeScript friendly service builder for FeathersJS.

This service builder allows you to create strongly typed Feathers services to help ensure that you have the data you *think* you have. It also helps enforce good practices by requiring you to validate your input, format your output, and decide if you want to publish events. It also allows you to easily add logging with timing, so you can track how long your hooks and methods take to run.

# Installation

```
npm install feathers-service-builder --save
```

# Why should I use it?

Feathers allows you to define services in many different ways. While this flexibility is powerful, it also makes it next-to-impossible to have reliable TypeScript definitions. By restricting service definition to one simple pattern, reliable definitions can be enforced.

*Ever get confused about what your input is?*

feathers-service-builder requires you to validate your inputs, but then your inputs are strongly typed through the rest of the method, hook, and event publishing pipeline. You also get strong typing for the params that you set on your hooks.

*Ever accidentally expose unwanted fields to end users?*

feathers-service-builder requires you to format your outputs or specifically declare them as unformatted. This helps ensure that you don't pass along any secret internal fields because you forgot to add an after hook to filter them out.

# Demos

There are two sample applications provided to get you started. The [first](examples/simple) is a simple message storage and retrieval application. The [other](examples/chat) is a chat application with simple bots.

# Usage

## How do I write a hook?

Feathers-service-builder has four types of hooks, `BeforeHook`, `ValidateHook`, `OutputHook`, and `AfterHook`.

### `BeforeHook<P2, P>`

A `BeforeHook` is used to perform some operations before a method and alter `hook.params` before continuing on. The type `P2` defines the parameters that are set by the hook when it runs. The optional type `P` defines the parameters that are required before the hook is called.

Example:

```typescript
interface AccessParams {
    accessToken: string;
}

interface HeaderParams extends AccessParams {
    headers: {
        authorization: string;
    };
}

export function tokenFromHeaders(): BeforeHook<AccessParams, HeaderParams> {
    return (hook: BeforeContext<void, HeaderParams>): BeforeContext<void, AccessParams> => {
        if (!hook.params.accessToken && hook.params.headers.authorization) {
            hook.params.accessToken = hook.params.headers.authorization;
        }
        return hook;
    };
}
```

### `ValidateHook<I, P>`

A `ValidateHook` is used to validate input before calling the service method. The type `I` defines the type of `hook.data`. The optional type `P` defines the parameters that are required before the hook is called.

A `ValidateHook` should validate all of the properties of `hook.data` match the expected types of `I`. It is a good idea to assign a new object to `hook.data` containing only the validated data. This will avoid any extra unvalidated properties from being accidentally passed along in the service method.

[Example](examples/chat/services/hooks/validate.ts)

### `OutputHook<P, P2, O, O2, I>`

TODO: Make example

[Example](examples/chat/services/hooks/output.ts)

### `AfterHook<P, P2, O, I>`

TODO: Make example

## How do I configure logging?

When you call `new ServiceBuilder()` you can provide a logger to be used for all services created by that builder. You can also set a global logger for all service builders by calling `ServiceBuilder.setGlobalLogger()`.

If you decide to mix the two, the logger passed in `new ServiceBuilder()` will be used instead of the global logger.

## How do I write a logger?

An example logger is available [here](examples/chat/services/logger.ts).

A logger has three optional methods, `logEvent`, `logHook`, and `logMethod`.

Common Parameters:
 - `app`: The Feathers application
 - `service`: The name of the service being called
 - `start`: The `Date` when the event listener/hook/method started
 - `duration`: The execution duration in milliseconds

### logEvent(app, event, service, start, duration, listener)

`logEvent()` is called to log information about event listeners. When your application listens for a published event (by using `.on()`) timing is collected and provided to `logEvent()`. This can be helpful if you have complex actions that occur in response to published events.

Asynchronous event handlers should return a Promise to ensure accurate timing.

**NOTE:** Events are only logged when `.on()` is called with a third *listener* parameter, which is provided to the `logEvent` method to distinguish between different handlers for the same event.

### logHook(hook, name, start, duration, parallel?)

`logHook()` is called to log information about hook execution. When multiple hooks are run in parallel by providing multiple hooks in a `beforeAll()`, `before()`, `after()`, or `afterAll()` call, the duration of the entire parallel hook is provided in the `parallel` parameter.

**NOTE:** The hook name comes from the hook function. In order to have a meaningful value, you must use a named function.

### logMethod(app, hookParams, service, method, start, duration, withHooks?)

`logMethod()` is called to log information about service method calls. If the method was called externally (`hook.provider` is undefined), the duration including all hooks is provided as a Promise in the `withHooks` parameter. The `hookParams` parameter is the same as `hook.params` in the method call.

**NOTE:** Feathers does not run hooks on methods that are called internally.

# Why is it so verbose?

Sometimes it can seem excessive to keep specifying `.unformatted()` and `.silent()` for so many methods. This is intentional. The purpose of this is to ensure that you consider what your service is doing.

If your returned value comes straight from a different service or database, are you sure you want to provide all those fields to the user?

Have you considered if your service should publish messages to other connected clients?
