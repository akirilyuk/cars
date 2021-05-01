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
  describe('test PUT /api/car/:id', () => {
    it('should return 404 if desired car not found', async () => {
      // first we do the first health check => we init the db connection etc
      const path = `/api/car/${mongoose.Types.ObjectId()}`;
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const { body, status } = await supertest(app).get(path);
      expect(status).toEqual(httpStatus.NOT_FOUND);
      expect(body).toEqual({
        error: {
          message: 'could not find car',
          status: httpStatus.NOT_FOUND,
          code: constErrors.handler.car.findCarById.notFound
        }
      });

      expect(saveSpy).not.toHaveBeenCalled();
    });
    it('should return 200 and update car vendor in DB if car exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      carCopy.vendor = ModelCar.ENUMS.VENDOR.BMW;

      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');

      const { body, status } = await supertest(app).put(path).send(carCopy);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(carCopy);

      // verify we have called save two times,
      expect(saveSpy).toHaveBeenCalledTimes(1);

      // verify we really updated the item in the database
      const newItemInDB = await ModelCar.findById(carCopy.id);

      expect(newItemInDB.toJSON()).toEqual(carCopy);
    });
    it('should return 200 and update car color in DB if car exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      carCopy.color = ModelCar.ENUMS.COLOR.GREEN;

      const path = `/api/car/${existingCarModel._id.toString()}`;
      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const { body, status } = await supertest(app).put(path).send(carCopy);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(carCopy);

      expect(saveSpy).toHaveBeenCalledTimes(1);

      // verify we really updated the item in the database
      const newItemInDB = await ModelCar.findById(carCopy.id);

      expect(newItemInDB.toJSON()).toEqual(carCopy);
    });
    it('should return 200 and update car seats in DB if car exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      carCopy.seats = ModelCar.ENUMS.SEATS.TWO;

      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const { body, status } = await supertest(app).put(path).send(carCopy);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(carCopy);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      // verify we really updated the item in the database
      const newItemInDB = await ModelCar.findById(carCopy.id);

      expect(newItemInDB.toJSON()).toEqual(carCopy);
    });

    it('should return 200 and update car cabrio in DB if car exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      carCopy.cabrio = false;

      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const { body, status } = await supertest(app).put(path).send(carCopy);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(carCopy);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      // verify we really updated the item in the database
      const newItemInDB = await ModelCar.findById(carCopy.id);

      expect(newItemInDB.toJSON()).toEqual(carCopy);
    });

    it('should return 200 and update car transmission in DB if car exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      carCopy.automaticTransmission = true;

      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');

      const { body, status } = await supertest(app).put(path).send(carCopy);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(carCopy);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      // verify we really updated the item in the database
      const newItemInDB = await ModelCar.findById(carCopy.id);

      expect(newItemInDB.toJSON()).toEqual(carCopy);
    });

    it('should return 400 and not update car in DB if nothing to changed', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const { body, status } = await supertest(app)
        .put(path)
        .send(existingCarModel.toJSON());

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: 'nothing to update',
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.updateCar.noChanges
        }
      });
      expect(saveSpy).toHaveBeenCalledTimes(0);
    });

    it('should return 500 if something failed during DB update', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      carCopy.automaticTransmission = true;

      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const errorMessage = 'could not save';
      saveSpy.mockRejectedValue(new Error(errorMessage));
      const { body, status } = await supertest(app).put(path).send(carCopy);

      expect(status).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: {
          message: errorMessage,
          status: httpStatus.INTERNAL_SERVER_ERROR,
          code: constErrors.handler.car.updateCar.mongoError
        }
      });
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 400 and not get car from db and not update car in DB if color value not in ENUM', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carJSON = existingCarModel.toJSON();

      carJSON.color = 'random color';
      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const findByIdSpy = jest.spyOn(ModelCar, 'findById');
      const { body, status } = await supertest(app).put(path).send(carJSON);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateUpdate.validationError
        }
      });
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('should return 400 and not get car from db and not update car in DB if vendor value not in ENUM', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carJSON = existingCarModel.toJSON();

      carJSON.vendor = 'random vendor';
      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const findByIdSpy = jest.spyOn(ModelCar, 'findById');
      const { body, status } = await supertest(app).put(path).send(carJSON);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateUpdate.validationError
        }
      });
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('should return 400 and not get car from db and not update car in DB if seats value not in ENUM', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carJSON = existingCarModel.toJSON();

      carJSON.seats = 'random seats string';
      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const findByIdSpy = jest.spyOn(ModelCar, 'findById');
      const { body, status } = await supertest(app).put(path).send(carJSON);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateUpdate.validationError
        }
      });
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('should return 400 and not get car from db and not update car in DB if cabrio value is string', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carJSON = existingCarModel.toJSON();

      carJSON.cabrio = 'random cabrio string';
      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const findByIdSpy = jest.spyOn(ModelCar, 'findById');
      const { body, status } = await supertest(app).put(path).send(carJSON);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateUpdate.validationError
        }
      });
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('should return 400 and not get car from db and not update car in DB if automaticTransmission value is string', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carJSON = existingCarModel.toJSON();

      carJSON.automaticTransmission = 'random transmission string';
      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const findByIdSpy = jest.spyOn(ModelCar, 'findById');
      const { body, status } = await supertest(app).put(path).send(carJSON);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateUpdate.validationError
        }
      });
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it('should return 200 and update car transmission in DB if car exists, only automaticTransmission and id provided', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      const updateBody = {
        id: carCopy.id,
        automaticTransmission: true
      };
      const path = `/api/car/${existingCarModel._id.toString()}`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');

      const { body, status } = await supertest(app).put(path).send(updateBody);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({
        ...carCopy,
        automaticTransmission: updateBody.automaticTransmission
      });
      expect(saveSpy).toHaveBeenCalledTimes(1);

      // verify we really updated the item in the database
      const newItemInDB = await ModelCar.findById(carCopy.id);

      expect(newItemInDB.toJSON()).toEqual({
        ...carCopy,
        automaticTransmission: updateBody.automaticTransmission
      });
    });

    it('should return 400 and not get car from db and not update car in DB if params id does not match body id', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carJSON = existingCarModel.toJSON();

      carJSON.automaticTransmission = true;
      const path = `/api/car/another-random-id`;

      // create the spy after populated the db
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      const findByIdSpy = jest.spyOn(ModelCar, 'findById');
      const { body, status } = await supertest(app).put(path).send(carJSON);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateId.mismatch
        }
      });
      expect(saveSpy).not.toHaveBeenCalled();
      expect(findByIdSpy).not.toHaveBeenCalled();
    });
  });
});