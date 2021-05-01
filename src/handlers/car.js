module.exports = ({
  ModelCar,
  ApiError,
  httpStatus: { OK, NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST },
  constErrors: {
    handler: {
      car: {
        findCarById,
        updateCar,
        validateUpdate,
        validateId,
        updateCarWithFindOneAndUpdate,
        deleteCar
      }
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
   * to only update changed values rather than doing a full replace if all properties are provided.
   *
   * However if we want to save one additional DB call on doing update operations, we should use ModeCar.findOneAndUpdate()
   * function. The implementation for this is provided in the updateCarWithFindOneAndUpdate method.
   *
   * Please note that due to the current implementation of the tests to use save instead of findOneAndUpdate, most of them will fail, since we explicitly
   * check that save is called.
   *
   * https://mongoosejs.com/docs/documents.html#updating-using-save
   *
   * https://mongoosejs.com/docs/tutorials/findoneandupdate.html
   * https://mongoosejs.com/docs/api.html#model_Model.updateOne
   *
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
   * Update a car in the DB without fetching it before, for more information see JSDoc of updateCar handler
   * @return {Promise<void>}
   */
  updateCarWithFindOneAndUpdate: async (req, res, next) => {
    let error;
    const {
      body,
      params: { id }
    } = req;
    let car;
    try {
      car = await ModelCar.findOneAndUpdate(
        { _id: id },
        { ...body },
        { new: true }
      );
      res.locals.car = car;
    } catch (err) {
      error = new ApiError(
        err,
        updateCarWithFindOneAndUpdate.mongoError,
        INTERNAL_SERVER_ERROR
      );
    }

    if (!error && !car) {
      error = new ApiError(
        { message: 'could not find document to update' },
        updateCarWithFindOneAndUpdate.notFound,
        NOT_FOUND
      );
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
  },

  /**
   * Deletes a single car from the database. Returns 404 if the car was not found in DB. We could argue here that the api
   * call should return 200 instead if the item was not found, since it won't make a difference, as I want to delete the item
   * anyway, however in my opinion it is cleaner to have a feedback if the item does not exists at all prior to calling the api.
   *
   * @param req {IncomingMessage} incoming request message
   * @param res {ServerResponse} express server response
   * @param next {function} callback function to trigger next route
   * @return {Promise<void>}
   */
  deleteCar: async (req, res, next) => {
    const {
      params: { id }
    } = req;

    let error;
    try {
      const { deletedCount } = await ModelCar.deleteOne({ _id: id });
      if (deletedCount === 1) {
        res.status(OK).send({});
      } else {
        error = new ApiError(
          { message: 'item not found' },
          deleteCar.notFound,
          NOT_FOUND
        );
      }
    } catch (err) {
      error = new ApiError(err, deleteCar.mongoError, INTERNAL_SERVER_ERROR);
    }

    next(error);
  }
});
