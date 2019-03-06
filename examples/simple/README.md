# Simple feathers-service-builder example application

This is a simple application that will allow you to add, retrieve, and remove simple JSON messages.

To install the application dependencies:

`npm install`

To build the application:

`npm run build`

To run the application:

`npm run start`

To add an item:
```
curl -H "Content-Type: application/json" \
    --data '{"id":"hi","message":"Hello"}' \
    http://localhost:8080/test
```

To retrieve an item:
```shell
curl http://localhost:8080/test/hi
```

To remove an item:
```
curl -X "DELETE" http://localhost:8080/test/hi
```