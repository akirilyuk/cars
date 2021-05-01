const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const httpStatus = require('http-status-codes');
const winston = require('winston');
const Ajv = require('ajv');
const { createContainer, asValue, asFunction } = require('awilix');

const { routerCar, routerHealth } = require('./routes');
const { handlerCar } = require('./handlers');
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

  ModelCar: asFunction(ModelCar).singleton(),
  express: asValue(express),
  config: asValue(config),

  mongoClient: asFunction(mongoClient).singleton(),
  logger: asFunction(logger).singleton(),

  routerCar: asFunction(routerCar).singleton(),
  routerHealth: asFunction(routerHealth).singleton(),

  handlerCar: asFunction(handlerCar).singleton(),

  ApiError: asValue(ApiError),

  constErrors: asValue(constErrors)
});

const app = container.resolve('express')();

const log = container.resolve('logger')(app);

app.use('/health/ping', (req, res) => {
  res.status = 200;
  res.send({
    message: 'pong'
  });
});

app
  .use(bodyParser.json())
  .use('/api', container.resolve('routerCar'))
  .use('/health', container.resolve('routerHealth'));

// eslint-disable-next-line max-params
app.use('/api', (error, req, res, next) => {
  const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const errorObject = {
    message: error.message,
    status: error.statusCode,
    code: error.errorCode
  };
  res.status(statusCode).json({
    error: errorObject
  });
  log.error('encountered api error', {
    error: { ...errorObject, stack: error.stack },
    statusCode
  });

  next();
});

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
