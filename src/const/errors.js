module.exports = {
  handler: {
    car: {
      findCarById: {
        notFound:
          'com.akirilyuk.cars.errors.handler.car.find-car-by-id.not-found',
        mongoError:
          'com.akirilyuk.cars.errors.handler.car.find-car-by-id.mongo-error'
      }
    }
  }
};
