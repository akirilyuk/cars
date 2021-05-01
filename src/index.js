const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const httpStatus = require('http-status-codes');
const winston = require('winston');
const Ajv = require('ajv');
const { v4: uuid } = require('uuid');
const { createContainer, asValue, asFunction } = require('awilix');

const { routerCar, routerHealth } = require('./routes');
const { handlerCar, handlerDefault } = require('./handlers');
const { ModelCar } = require('./models');
const { mongoClient, logger } = require('./lib');
const { ApiError } = require('./util');
const { constErrors } = require('./const');
const config = require('./config');

const ajv = new Ajv();

const container = createContainer();

container.register({
  winston: asValue(winston),
  httpStatus: asValue(httpStatus),
  mongoose: asValue(mongoose),
  ajv: asValue(ajv),
  uuid: asValue(uuid),

  ModelCar: asFunction(ModelCar).singleton(),
  express: asValue(express),
  config: asValue(config),

  mongoClient: asFunction(mongoClient).singleton(),
  logger: asFunction(logger).singleton(),

  routerCar: asFunction(routerCar).singleton(),
  routerHealth: asFunction(routerHealth).singleton(),

  handlerCar: asFunction(handlerCar).singleton(),
  handlerDefault: asFunction(handlerDefault).singleton(),

  ApiError: asValue(ApiError),

  constErrors: asValue(constErrors)
});

const app = container.resolve('express')();

const log = container.resolve('logger')(app);
const { preRequest, successHandler, errorHandler } = container.resolve(
  'handlerDefault'
);
app
  .use(bodyParser.json())
  .use(preRequest)
  .use('/api', container.resolve('routerCar'))
  .use('/health', container.resolve('routerHealth'))
  .use(successHandler);

// only use the error handler for /api endpoint since we expect a different payload on health errors
app.use('/api', errorHandler);

const server = app.listen(config.GLOBAL.PORT);

server.stopServer = async () => {
  return new Promise(async resolve => {
    const mongoDbClient = container.resolve('mongoClient');
    await mongoDbClient.disconnect();
    server.close(resolve);
  });
};

log.info('successfully started application server', {
  port: config.GLOBAL.PORT
});
module.exports = { server, container };
