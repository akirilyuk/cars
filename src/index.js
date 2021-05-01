const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const httpStatus = require('http-status-codes');
const winston = require('winston');
const { createContainer, asValue, asFunction } = require('awilix');

const { routerCars, routerHealth } = require('./routes');
const { ModelCar } = require('./models');
const { mongoClient, logger } = require('./lib');
const config = require('./config');

const container = createContainer();

container.register({
  winston: asValue(winston),
  httpStatus: asValue(httpStatus),
  mongoose: asValue(mongoose),

  ModelCar: asFunction(ModelCar),
  express: asValue(express),
  config: asValue(config),

  mongoClient: asFunction(mongoClient).singleton(),
  logger: asFunction(logger).singleton(),

  routerCars: asFunction(routerCars).singleton(),
  routerHealth: asFunction(routerHealth).singleton()
});

const app = container.resolve('express')();

const log = container.resolve('logger')(app);

app.use('/_health/ping', (req, res) => {
  res.status = 200;
  res.send({
    message: 'pong'
  });
});

app
  .use(bodyParser.json())
  .use('/api', container.resolve('routerCars'))
  .use('/health', container.resolve('routerHealth'));

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
