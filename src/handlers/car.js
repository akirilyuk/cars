module.exports = ({
  ModelCar,
  ApiError,
  httpStatus: { OK, NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST },
  constErrors: {
    handler: {
      car: { findCarById, updateCar }
    }
  }
}) => ({
  findCarById: async (req, res, next) => {
    const { id } = req.params;
    let error;
    try {
      const car = await ModelCar.findById(id);
      if (car) {
        res.locals.car = car;
      } else {
        error = new ApiError(
          {
            message: 'could not find car'
          },
          findCarById.notFound,
          NOT_FOUND
        );
      }
    } catch (err) {
      error = new ApiError(err, findCarById.mongoError, INTERNAL_SERVER_ERROR);
    }

    return next(error);
  },
  returnCar: (req, res, next) => {
    const { car } = res.locals;
    res.status(OK).json(car.toJSON());
    next();
  },
  updateCar: async (req, res, next) => {
    const { body } = req;
    const { car } = res.locals;
    let error;
    let changed = false;
    const carJSON = car.toJSON();
    // iterate over the provided car body and only update value on model which were changed
    Object.entries(body).forEach(([key, value]) => {
      if (carJSON[key] !== value) {
        car[key] = value;
        changed = true;
      }
    });

    if (!changed) {
      return next(
        new ApiError(
          { message: 'nothing to update' },
          updateCar.noChanges,
          BAD_REQUEST
        )
      );
    }

    try {
      await car.save();
    } catch (err) {
      error = new ApiError(err, updateCar.mongoError, INTERNAL_SERVER_ERROR);
    }

    return next(error);
  }
});
