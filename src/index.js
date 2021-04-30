const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const httpStatus = require('http-status-codes');
const winston = require('winston');

const { createContainer, asValue, asFunction } = require('awilix');
const { routerCars } = require('./routes');
const { ModelCar } = require('./models');
const { mongoClient } = require('./lib');
const config = require('./config');

const container = createContainer();

container.register({
  winston: asValue(winston),
  httpStatus: asValue(httpStatus),
  mongoose: asValue(mongoose),
  routerCars: asFunction(routerCars),
  ModelCar: asFunction(ModelCar),
  express: asValue(express),
  config: asValue(config),
  mongoClient: asFunction(mongoClient)
});

const app = container.resolve('express')();

app.use('/_health/ping', (req, res) => {
  res.status = 200;
  res.send({
    message: 'pong'
  });
});

app.use(bodyParser.json()).use('/api', container.resolve('routerCars'));

const server = app.listen(config.GLOBAL.PORT);

module.exports = server;
