module.exports = ({
  ModelCar,
  ApiError,
  httpStatus: { OK, NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST },
  constErrors: {
    handler: {
      car: { findCarById, updateCar, validateUpdate, validateId }
    }
  }
}) => ({
  /**
   * Find one car in the DB by the provided car id. If we can't find the car in the DB, throw a not found error,
   * on any DB error we will throw a mongoError and 500, else if all succeeded, we will append the mongo car document
   * to res.locals for futher processing
   * @param req {IncomingMessage} incoming request message
   * @param res {ServerResponse} express server response
   * @param next {function} callback function to trigger next route
   * @return {Promise<*>}
   */
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
  /**
   * Get the mongoose car object from server response locals, create a JSON object and return it to the api consumer
   * @param req {IncomingMessage} incoming request message
   * @param res {ServerResponse} express server response
   * @param next {function} callback function to trigger next route
   */
  returnCar: (req, res, next) => {
    const { car } = res.locals;
    res.status(OK).json(car.toJSON());
    next();
  },
  /**
   * Updates an existing car in the DB. Note that we are using the save() method of prefetched model from the mongoDB.
   * Why? First of all, because one requirement of the coding challenge is
   *  "Updaten single properties of a single car (not a full replace operation)"
   *
   *  While implementing this logic I have identified 2 possible ways:
   *
   *  1. Use the findOneAndUpdate method where I provide the _id in the query and the properties to update in the update
   *  arg.
   *  2. First fetch the model from DB, then set the changed values on the doc and call save, like this only the changed values are updated
   *  in mongo
   * The problem with the 1. approach is that if the API consumer provides ALL properties, we would do a FULL replace of
   * the properties in the DB, rather than only updating the changed ones...
   *
   * After further reading the mongoDB documentation, (https://docs.mongodb.com/manual/reference/operator/update/set/)
   * an update with all provided values will replace each of the provided values in the DB.
   *
   * Because of this I have decided to go with the second approach and hope that this was the right decisions and per requirements
   * to only update changed values rather than doing a full replace.
   *
   * https://mongoosejs.com/docs/documents.html#updating-using-save
   *
   * https://mongoosejs.com/docs/tutorials/findoneandupdate.html
   * https://mongoosejs.com/docs/api.html#model_Model.updateOne
   *
   *
   * @param req {IncomingMessage} incoming request message
   * @param res {ServerResponse} express server response
   * @param next {function} callback function to trigger next route
   * @return {Promise<*>}
   */
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
  },
  /**
   * Validate the update body by calling the static validateUpdate method on the ModelCar class. If the validation fails, errors
   * equals to the stringified validation errors from AJV. Else if no validation errors are resent, we will proceed with the next request
   * @param req {IncomingMessage} incoming request message
   * @param res {ServerResponse} express server response
   * @param next {function} callback function to trigger next route
   */
  validateUpdate: (req, res, next) => {
    const { body } = req;

    const errors = ModelCar.validateUpdate(body);
    if (!errors) {
      next();
    } else {
      next(
        new ApiError(
          { message: errors },
          validateUpdate.validationError,
          BAD_REQUEST
        )
      );
    }
  },

  /**
   * Validates if the id in the request params matches the id in the body
   * @param req {IncomingMessage} incoming request message
   * @param res {ServerResponse} express server response
   * @param next {function} callback function to trigger next route
   */
  validateId: (req, res, next) => {
    const {
      body,
      params: { id }
    } = req;

    if (id === body.id) {
      next();
    } else {
      next(
        new ApiError(
          { message: 'provided ids do not match' },
          validateId.mismatch,
          BAD_REQUEST
        )
      );
    }
  }
});
