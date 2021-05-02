module.exports = {
  handler: {
    car: {
      v1: {
        findCarById: {
          notFound:
            'com.akirilyuk.cars.errors.handler.car.v1.find-car-by-id.not-found',
          mongoError:
            'com.akirilyuk.cars.errors.handler.car.v1.find-car-by-id.mongo-error'
        },
        updateCar: {
          mongoError:
            'com.akirilyuk.cars.errors.handler.car.v1.update-car.mongo-error',
          noChanges:
            'com.akirilyuk.cars.errors.handler.car.v1.update-car.no-changes'
        },
        updateCarWithFindOneAndUpdate: {
          mongoError:
            'com.akirilyuk.cars.errors.handler.car.v1.update-car-with-find-one-and-update.mongo-error',
          notFound:
            'com.akirilyuk.cars.errors.handler.car.v1.update-car-with-find-one-and-update.not-found'
        },
        validateUpdate: {
          validationError:
            'com.akirilyuk.cars.errors.handler.car.v1.validate-update.validation-error'
        },
        validateId: {
          mismatch:
            'com.akirilyuk.cars.errors.handler.car.v1.validate-id.mismatch'
        },
        deleteCar: {
          notFound:
            'com.akirilyuk.cars.errors.handler.car.v1.delete-car.not-found',
          mongoError:
            'com.akirilyuk.cars.errors.handler.car.v1.delete-car.mongo-error'
        },
        createCar: {
          mongoError:
            'com.akirilyuk.cars.errors.handler.car.v1.create-car.mongo-error'
        },
        validateCreate: {
          validationError:
            'com.akirilyuk.cars.errors.handler.car.v1.validate-create.validation-error'
        },
        getCars: {
          mongoError:
            'com.akirilyuk.cars.errors.handler.car.v1.get-cars.mongo-error'
        }
      }
    }
  }
};
