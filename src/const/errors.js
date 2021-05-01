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
      }
    }
  }
};
