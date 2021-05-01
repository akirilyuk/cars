module.exports = ({
  ModelCar,
  ApiError,
  httpStatus: { OK, NOT_FOUND, INTERNAL_SERVER_ERROR },
  constErrors: {
    handler: {
      car: { findCarById }
    }
  }
}) => ({
  findCarById: async (req, res, next) => {
    const { id } = req.params;
    let error;
    try {
      const foundCar = await ModelCar.findById(id);
      if (foundCar) {
        res.status(OK).json(foundCar.toJSON());
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
  }
});
