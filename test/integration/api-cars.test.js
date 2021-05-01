/* eslint-disable global-require */

const supertest = require('supertest');
const httpStatus = require('http-status-codes');
const { MONGO } = require('../../src/config');
const { constErrors } = require('../../src/const');

let app;
let mongod;
let mongoose;
let connection;
let ModelCar;
describe('test health api', () => {
  beforeEach(async () => {
    // always reset all critical modules to do not have side effects between the different test runs...
    jest.resetModules();
    jest.clearAllMocks();
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
    const connectString = `mongodb://${MONGO.ADDRESS}:${MONGO.PORT}/${MONGO.DATABASE_NAME}`;

    connection = await mongoose.connect(connectString, MONGO.OPTIONS);
    mongoose.connection.on('error', error => {
      this.log.error('encountered mongo error', { error });
    });

    // always start a new server instance to have a clean state
    const { server, container } = require('../../src');
    app = server;

    ModelCar = container.resolve('ModelCar');
  });

  afterEach(async () => {
    // stop the api server and mongo in memory database lib
    await app.stopServer();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('test GET /api/car/:id', () => {
    it('should return 404 if desired car not found', async () => {
      // first we do the first health check => we init the db connection etc
      const path = `/api/car/${mongoose.Types.ObjectId()}`;
      const { body, status } = await supertest(app).get(path);
      expect(status).toEqual(httpStatus.NOT_FOUND);
      expect(body).toEqual({
        error: {
          message: 'could not find car',
          status: httpStatus.NOT_FOUND,
          code: constErrors.handler.car.findCarById.notFound
        }
      });
    });
    it('should return 500 if id not a real mongo object id', async () => {
      // first we do the first health check => we init the db connection etc
      const path = `/api/car/test`;
      const { body, status } = await supertest(app).get(path);
      expect(status).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.INTERNAL_SERVER_ERROR,
          code: constErrors.handler.car.findCarById.mongoError
        }
      });
    });
    it('should return 200 if car exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const path = `/api/car/${existingCarModel._id.toString()}`;
      const { body, status } = await supertest(app).get(path);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(existingCarModel.toJSON());
    });
  });
});
