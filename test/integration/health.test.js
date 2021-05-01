/* eslint-disable global-require */

const supertest = require('supertest');
const httpStatus = require('http-status-codes');

const { MONGO } = require('../../src/config');

let app;
let awilixContainer;
let mongod;
let mongoose;
describe('test health api', () => {
  beforeEach(async () => {
    // always reset all critical modules to do not have side effects between the different test runs...
    jest.resetModules();
    mongoose = require('mongoose');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = new MongoMemoryServer({
      instance: {
        port: MONGO.PORT,
        ip: MONGO.ADDRESS,
        dbName: MONGO.DATABASE_NAME
      }
    });
    // wait until mongo memory server connection is established
    await mongod.getUri();

    // always start a new server instance to have a clean state
    const { server, container } = require('../../src');
    app = server;
    awilixContainer = container;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // stop the api server and mongo in memory database lib
    await app.stopServer();
    await mongod.stop();
  });

  describe('test GET /health/current', () => {
    const path = `/health/current`;
    it('should return 500 if mongodb connection is unhealthy', async () => {
      // first we do the first health check => we init the db connection etc
      const { body, status } = await supertest(app).get(path);
      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({ mongo: { healthy: true } });

      const mongoClient = awilixContainer.resolve('mongoClient');

      await mongoClient.disconnect();

      // verify that we are really disconnected and are not faking the healthy connection...
      expect(mongoose.STATES[mongoose.connection.readyState]).toEqual(
        'disconnected'
      );

      const { body: body2, status: status2 } = await supertest(app).get(path);
      expect(status2).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
      expect(body2).toEqual({ mongo: { healthy: false } });
    });
    it('should return 200 if mongodb connection is healthy', async () => {
      const { body, status } = await supertest(app).get(path);
      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({ mongo: { healthy: true } });

      // verify that we are really connected and are not faking the healthy connection...
      expect(mongoose.STATES[mongoose.connection.readyState]).toEqual(
        'connected'
      );
    });
  });
});
