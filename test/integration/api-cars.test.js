/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */

const supertest = require('supertest');
const httpStatus = require('http-status-codes');
const { MONGO } = require('../../src/config');
const { constErrors } = require('../../src/const');

let app;
let mongod;
let mongoose;
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

    await mongoose.connect(connectString, MONGO.OPTIONS);
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
  describe('test DELETE /api/car/:id', () => {
    it('should return 200 and delete car from database if exists', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();

      const carCopy = existingCarModel.toJSON();

      const path = `/api/car/${carCopy.id}`;

      const { body, status } = await supertest(app).delete(path);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({});

      // verify we really updated the item in the database
      const existingCarModelInDB = await ModelCar.findById(carCopy.id);
      expect(existingCarModelInDB).toBeNull();
    });
    it('should return 404 and not delete car from database if does not exist in DB', async () => {
      const path = `/api/car/${mongoose.Types.ObjectId()}`;

      const { body, status } = await supertest(app).delete(path);

      expect(status).toEqual(httpStatus.NOT_FOUND);
      expect(body).toEqual({
        error: {
          message: 'item not found',
          status: httpStatus.NOT_FOUND,
          code: constErrors.handler.car.deleteCar.notFound
        }
      });
    });
    it('should return 500 on DB error', async () => {
      const path = `/api/car/${mongoose.Types.ObjectId()}`;

      const deleteOneSpy = jest.spyOn(ModelCar, 'deleteOne');

      const errorMessage = 'some mongo error';
      deleteOneSpy.mockRejectedValueOnce(new Error(errorMessage));

      const { body, status } = await supertest(app).delete(path);

      expect(status).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: {
          message: errorMessage,
          status: httpStatus.INTERNAL_SERVER_ERROR,
          code: constErrors.handler.car.deleteCar.mongoError
        }
      });
    });
  });
  describe('test POST /api/car', () => {
    const path = `/api/car/`;
    it('should return 200 and create a new car on valid input', async () => {
      const carPayload = {
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      };
      const { body, status } = await supertest(app).post(path).send(carPayload);

      expect(status).toEqual(httpStatus.CREATED);

      expect(body).toEqual({ id: expect.toBeString(), ...carPayload });

      const createdCarInDB = await ModelCar.findById(body.id);

      expect(createdCarInDB.toJSON()).toEqual(body);
    });
    it('should return 500 and return error if saving car to DB failed', async () => {
      const carPayload = {
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      };
      const errorMessage = 'some  mongo error';
      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');
      saveSpy.mockRejectedValueOnce(new Error(errorMessage));

      const { body, status } = await supertest(app).post(path).send(carPayload);

      expect(status).toEqual(httpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toEqual({
        error: {
          message: errorMessage,
          status: httpStatus.INTERNAL_SERVER_ERROR,
          code: constErrors.handler.car.createCar.mongoError
        }
      });
    });
    it('should return 400 and return error if not all properties provided ', async () => {
      const carPayload = {
        color: ModelCar.ENUMS.COLOR.BLUE,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        automaticTransmission: false
      };

      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');

      const { body, status } = await supertest(app).post(path).send(carPayload);

      expect(status).toEqual(httpStatus.BAD_REQUEST);

      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateCreate.validationError
        }
      });

      expect(saveSpy).not.toHaveBeenCalled();
    });
    it('should return 400 and return error if not property values not in enum propertie ', async () => {
      const carPayload = {
        color: 'purple',
        vendor: 'kia',
        seats: 1000,
        cabrio: true,
        automaticTransmission: false
      };

      const saveSpy = jest.spyOn(ModelCar.prototype, 'save');

      const { body, status } = await supertest(app).post(path).send(carPayload);

      expect(status).toEqual(httpStatus.BAD_REQUEST);

      expect(body).toEqual({
        error: {
          message: expect.toBeString(),
          status: httpStatus.BAD_REQUEST,
          code: constErrors.handler.car.validateCreate.validationError
        }
      });

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
  describe('test GET /api/car', () => {
    const path = '/api/car';
    it('should return 200 and right number ob meta count in db', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();
      const existingCarModel2 = new ModelCar({
        color: ModelCar.ENUMS.COLOR.RED,
        vendor: ModelCar.ENUMS.VENDOR.BMW,
        seats: ModelCar.ENUMS.SEATS.TWO,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel2.save();
      const existingCarModel3 = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.BMW,
        seats: ModelCar.ENUMS.SEATS.SIX,
        cabrio: false,
        automaticTransmission: false
      });
      await existingCarModel3.save();
      const existingCarModel4 = new ModelCar({
        color: ModelCar.ENUMS.COLOR.GREEN,
        vendor: ModelCar.ENUMS.VENDOR.MERCEDES,
        seats: ModelCar.ENUMS.SEATS.SIX,
        cabrio: false,
        automaticTransmission: true
      });
      await existingCarModel4.save();
      const { body, status } = await supertest(app).get(path);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({
        count: 4,
        color: {
          blue: 2,
          green: 1,
          red: 1,
          yellow: 0
        },
        vendor: {
          bmw: 2,
          mercedes: 1,
          volkswagen: 1
        },
        seats: {
          2: 1,
          4: 1,
          6: 2
        },
        cabrio: {
          true: 2,
          false: 2
        },
        automaticTransmission: {
          true: 1,
          false: 3
        }
      });

      // ensure that we really have 4 cars in the database ...
      const actualCarsInDB = await ModelCar.find({});
      expect(body.count).toEqual(actualCarsInDB.length);
    });
    it('should return 500 and right error code on mongo error during finding the cars', async () => {
      const existingCarModel = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.VOLKSWAGEN,
        seats: ModelCar.ENUMS.SEATS.FOUR,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel.save();
      const existingCarModel2 = new ModelCar({
        color: ModelCar.ENUMS.COLOR.RED,
        vendor: ModelCar.ENUMS.VENDOR.BMW,
        seats: ModelCar.ENUMS.SEATS.TWO,
        cabrio: true,
        automaticTransmission: false
      });
      await existingCarModel2.save();
      const existingCarModel3 = new ModelCar({
        color: ModelCar.ENUMS.COLOR.BLUE,
        vendor: ModelCar.ENUMS.VENDOR.BMW,
        seats: ModelCar.ENUMS.SEATS.SIX,
        cabrio: false,
        automaticTransmission: false
      });
      await existingCarModel3.save();
      const existingCarModel4 = new ModelCar({
        color: ModelCar.ENUMS.COLOR.GREEN,
        vendor: ModelCar.ENUMS.VENDOR.MERCEDES,
        seats: ModelCar.ENUMS.SEATS.SIX,
        cabrio: false,
        automaticTransmission: true
      });
      await existingCarModel4.save();

      const errorMessage = 'some mongo error';
      const findSpy = jest.spyOn(ModelCar, 'find');
      findSpy.mockRejectedValueOnce(new Error(errorMessage));

      const { body, status } = await supertest(app).get(path);

      expect(status).toEqual(httpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toEqual({
        error: {
          message: errorMessage,
          status: httpStatus.INTERNAL_SERVER_ERROR,
          code: constErrors.handler.car.getCars.mongoError
        }
      });
    });
  });
});
