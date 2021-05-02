# cars

Cars API coding challenge implementation 

## Description

This is the implementation of a coding challenge.

## Prerequisites

This project uses ``Node.js 14``, ``yarn`` and ``Docker`` with ``Docker-Compose``.
To be able to develop and start the project, please make sure that you have these tools installed on you computer.

## First start and running in dev mode

This project uses the ``yarn`` package manager. Before starting the application for the first time, please run

```shell
yarn
```

If you want to start the application in development mode with hot reload, please ensure that you have a mongodb up and 
running. You can refer to the configuration section to see how to setup the application correctly.

To start the application in dev mode with hot reload please run this command:

```shell
yarn dev
```

## Configuration

To configure your application you can either modify the default configuration values in ``./src/config``, or you can
set the configuration parameters via ENV variables. The following ENV variables are used by this application:

* NODE_ENV: Node environment, use PRODUCTION for running in production mode (info log level), else DEV for running in DEV mode (debug log level).
* GLOBAL_PORT: Application port, default is 3000
* MONGO_ADDRESS: mongo IP or dns name 
* MONGO_PORT: port of the mongo database
* MONGO_DATABASE_NAME: name of the mongo database
* MONGO_CONNECTION_TIMEOUT: mongo connection timeout

You can also set these config values within the docker-compose file for the ``app`` application

## Running via docker-compose

The project contains a docker-compose file which will start the mongodb, then wait for it to initialise and then start the application.
If you want to only start the mongodb without the app, for example to debug the application from within your IDE, your should comment out the app
in the docker-compose file

To start the docker-compose setup, please use the following command:

```shell
yarn docker-compose
```

## Code quality tools

This project implements a variety of automated code quality tools. It also has a automatic pre-push hook, which
checks the code for

* duplicated code
* linting errors
* test results
* security

If one of these automated check fails, you are not able to push the code. If you still insists to push it anyway, which
is strongly not recommended, you can push the code via ``git push --no-verify``

### Linting

To check you code for linting errors, please use the command below.

```shell
yarn lint
```

### Duplicated

To check your code for duplicated code, please use the command below.

```shell
yarn duplicated
```

### Security

To check the application dependencies for any security vulnerabilities, please use the command below.

```shell
yarn security
```

### Tests

To run the automated integration test suite, you can use the command below. The test suite will also collect the coverage report,
which you can find in ``./coverage/lcov-report/index.html`` and view it convenient within your browser.

```shell
yarn test
```

### Outdated

To check if any of the used dependencies and devDependencies is outdated, please use the command below:

```shell
yarn outofdate
```

## Committing to the project

The project uses the [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). branching model, so please make sure you understand it prior making branches and contributing code. To commit code,
you can use the command below, it utilizes commitizen with gitmojis to its easier to understand the content of the commit.

```shell
yarn commit
```

## Monitoring

Each request is logged twice: upon receiving the request and upon finishing the request. Also a localLogger instance is exposed in
``res.locals.localLogger`` which you can use for logging inside your request handler. By default, each log will contain the HTTP method, 
a unique request id in uuidv4 format and the request URL. Like this, each request can be easily traced and add any errors can be easily debugged. 
Furthermore, once the request handling is finished, the request duration is logged together with the returned HTTP status code.

Also, the application exposes a health route to get the status of the external dependencies, (mongodb) under ``/health/current``.
To check if the server is up you can use ``/health/ping``;

Request start:
```json
{
  "loggerContext":"request",
  "requestId":"dca0b177-e84a-4cbe-8c0d-fe5333938f8e",
  "url":"/api/v1/car/608eda4772cf555f55d6f494",
  "method":"GET",
  "startTime":1619974727474,
  "level":"info",
  "message":"received new api request",
  "timestamp":"2021-05-02T16:58:47.474Z"
}
```

Request finished (success):
```json
{
   "loggerContext":"request",
   "requestId":"bcd73141-e6f0-445a-83fa-1866f6756f3d",
   "url":"/api/v1/car/608ee38cb184c366e39bf215",
   "method":"GET",
   "duration":3,
   "endTime":1619977100482,
   "startTime":1619977100479,
   "statusCode":200,
   "level":"info",
   "message":"finished request",
   "timestamp":"2021-05-02T17:38:20.482Z"
}
```

Request error (client):
```json
{
   "loggerContext":"request",
   "requestId":"2c993184-cd5c-48cc-b75a-824ae8ea31cc",
   "url":"/api/v1/car/another-random-id",
   "method":"PUT",
   "duration":9,
   "endTime":1619975280944,
   "startTime":1619975280935,
   "statusCode":400,
   "errorCode":"com.akirilyuk.cars.errors.handler.car.v1.validate-id.mismatch",
   "error":"provided ids do not match",
   "trace":"Error: provided ids do not match\n    at validateId (/Users/akirilyuk/GIT/cars/src/handlers/v1/car.js:268:11)\n    at Layer.handle [as handle_request] (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/layer.js:95:5)\n    at next (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/route.js:137:13)\n    at Route.dispatch (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/route.js:112:3)\n    at Layer.handle [as handle_request] (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/layer.js:95:5)\n    at /Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:281:22\n    at param (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:354:14)\n    at param (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:365:14)\n    at Function.process_params (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:410:3)\n    at next (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:275:10)\n    at Function.handle (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:174:3)\n    at router (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:47:12)\n    at Layer.handle [as handle_request] (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:317:13)\n    at /Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:284:7\n    at Function.process_params (/Users/akirilyuk/GIT/cars/node_modules/express/lib/router/index.js:335:12)",
   "level":"warn",
   "message":"finished request with error",
   "timestamp":"2021-05-02T17:08:00.944Z"
}
```

Request error (server):
```json
{
   "loggerContext":"request",
   "requestId":"7fdc465a-f317-48c0-aefd-cc64cae4b571",
   "url":"/api/v1/car",
   "method":"GET",
   "duration":1,
   "endTime":1619977105670,
   "startTime":1619977105669,
   "statusCode":500,
   "errorCode":"com.akirilyuk.cars.errors.handler.car.v1.get-cars.mongo-error",
   "error":"some mongo error",
   "trace":"Error: some mongo error\n    at Object.<anonymous> (/Users/akirilyuk/GIT/cars/test/integration/api-cars-v1.test.js:802:37)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)",
   "level":"error",
   "message":"finished request with error",
   "timestamp":"2021-05-02T17:38:25.670Z"
}
```

## Error handling

For error handling, the ApiError object is exposed. To use the default error handler, just called next(error) within your handler.
Also, each time an error is returned by the api, a dedicated error code  is used, so if you receive an error, you directly know 
where exactly the error was thrown. Furthermore, each request error is logged with the error stack, 4xx errors are logged
with  ``warn`` level, 5xx errors with ``error`` level. If no status code was provided, we assume its ``INTERNAL_SERVER_ERROR``.

For examples you can checkout the code in ````

```js

// example error api response
const apiErrorResponse = {
  error: {
    message: 'item not found',
    status: 404,
    code: 'com.akirilyuk.cars.errors.handler.car.delete-car.not-found'
  }
}


```

## Dependency injection

The application uses [awilix](https://github.com/jeffijoe/awilix) as a dependency injection tool. The awilix container and all
application dependencies and internal code are added inside ``./src/index.js`` file. The good thing is, that awilix will
take care of resolving and creating the instances in the right order, so you won't have to worry about it.

Also, with this approach, unit tests are made with ease, since you can mock away every dependency by simply passing the stubs
into the first function.

Below are some basic example usages and implementations on the dependency injection pattern.

```js
// creating a new class to be used to create new instances inside container (Models etc)

module.exports = ({}) => { return class Test {} }

// in index.js add asFunction(yourNewClass).singleton()

// creating a new service to be shared between all container instances

module.exports = ({}) => { class Test {}; return new Test()}

// in index.js add asFunction(yourNewService).singleton()


// default container dependencies

module.exports = ({
  config, // configuration of core app
  ApiError, // ApiError object to be used for error handling
  httpStatus, // http status codes, npm http-status-codes package
  logger, // logger instance, creates a new logger via logger('loggerName', { default: 'context'});
  mongoose, // mongoose package
  ajv, // ajv validator instance
  uuid,  // uuid.v4 for unique id generation
  express // express package                 
}) => { return yourcodehere; } // return your instance, function, class here };

```


## API

Below you can find the exposed API routes with the an example CURL, request payload and responses. 
Furthermore, a Swagger collection can be found under ``./doc/Cars.postman_collection.json`` for your convenience.

### GET /api/v1/car

Get all metadata of all cars, and their count which are stored in the database

CURL:
```shell
curl --location --request GET 'http://localhost:3000/api/v1/car'
```

Response:
```json
{
  "color":{
    "blue":19,
    "red":2,
    "green":3,
    "yellow":0
  },
  "vendor":{
    "bmw":5,
    "mercedes":2,
    "volkswagen":17
  },
  "seats":{
    "2":3,
    "4":17,
    "6":4
  },
  "cabrio":{
    "true":19,
    "false":5
  },
  "automaticTransmission":{
    "true":4,
    "false":20
  },
  "count":24
}
```

### GET /api/v1/car/id

CURL:
```
curl --location --request GET 'http://localhost:3000/api/v1/car/608edf95a594dc63b3784768'
```

example response:
```json
{
  "color":"blue",
  "vendor":"volkswagen",
  "seats":4,
  "cabrio":true,
  "automaticTransmission":false,
  "id":"608edf95a594dc63b3784768"
}
```

### POST /api/v1/car

Create a new car in the DB.

CURL:
```shell
curl --location --request POST 'http://localhost:3000/api/v1/car' \
--header 'Content-Type: application/json' \
--data-raw '{
    "color": "red",
    "vendor": "bmw",
    "seats": 4,
    "cabrio": true,
    "automaticTransmission": true
}'
```

example payload:
```json
{
   "color":"red",
   "vendor":"bmw",
   "seats":4,
   "cabrio":true,
   "automaticTransmission":true
}
```

example response:
```json
{
   "color":"red",
   "vendor":"bmw",
   "seats":4,
   "cabrio":true,
   "automaticTransmission":true,
   "id":"608ee01fb09224001cec4eb5"
}
```



### PUT /api/v1/car/:id

Update one dedicated car in the db with the provided properties

CURL:
```shell
curl --location --request PUT 'http://localhost:3000/api/v1/car/608ee01fb09224001cec4eb5' \
--header 'Content-Type: application/json' \
--data-raw '{
    "color": "green",
    "automaticTransmission": false,
    "id": "608ee01fb09224001cec4eb5"
}'
```

example payload:
```json
{
  "color":"green",
  "automaticTransmission":false,
  "id":"608ee01fb09224001cec4eb5"
}
```

example response:
```json
{
   "color":"green",
   "vendor":"bmw",
   "seats":2,
   "cabrio":false,
   "automaticTransmission":false,
   "id":"608ee01fb09224001cec4eb5"
}
```

### DELETE /api/car/:id

remove one car from DB

CURL:
```shell
curl --location --request DELETE 'http://localhost:3000/api/v1/car/608ee01fb09224001cec4eb5'
```

example response:
```json
{}
```