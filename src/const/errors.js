module.exports = {
  handler: {
    car: {
      findCarById: {
        notFound:
          'com.akirilyuk.cars.errors.handler.car.find-car-by-id.not-found',
        mongoError:
          'com.akirilyuk.cars.errors.handler.car.find-car-by-id.mongo-error'
      },
      updateCar: {
        mongoError:
          'com.akirilyuk.cars.errors.handler.car.update-car.mongo-error',
        noChanges: 'com.akirilyuk.cars.errors.handler.car.update-car.no-changes'
      },
      updateCarWithFindOneAndUpdate: {
        mongoError:
          'com.akirilyuk.cars.errors.handler.car.update-car-with-find-one-and-update.mongo-error',
        notFound:
          'com.akirilyuk.cars.errors.handler.car.update-car-with-find-one-and-update.not-found'
      },
      validateUpdate: {
        validationError:
          'com.akirilyuk.cars.errors.handler.car.validate-update.validation-error'
      },
      validateId: {
        mismatch: 'com.akirilyuk.cars.errors.handler.car.validate-id.mismatch'
      },
      deleteCar: {
        notFound: 'com.akirilyuk.cars.errors.handler.car.delete-car.not-found',
        mongoError:
          'com.akirilyuk.cars.errors.handler.car.delete-car.mongo-error'
      },
      createCar: {
        mongoError:
          'com.akirilyuk.cars.errors.handler.car.create-car.mongo-error'
      },
      validateCreate: {
        validationError:
          'com.akirilyuk.cars.errors.handler.car.validate-create.validation-error'
      },
      getCars: {
        mongoError: 'com.akirilyuk.cars.errors.handler.car.get-cars.mongo-error'
      }
    }
  }
};
