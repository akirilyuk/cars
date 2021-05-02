module.exports = ({
  express,
  handlerCar: {
    findCarById,
    returnCar,
    updateCar,
    validateCreate,
    validateUpdate,
    validateId,
    deleteCar,
    createCar,
    getCarsMeta
    // updateCarWithFindOneAndUpdate //remove comment here to use updateCarWithFindOneAndUpdate
  }
}) => {
  const router = express.Router();

  /**
   * Get all metadata of all cars
   */
  router.get('/v1/car', getCarsMeta);

  /**
   * Create a new car
   */
  router.post('/v1/car', validateCreate, createCar);

  /**
   * Get car by ID
   */
  router.get('/v1/car/:id', findCarById, returnCar);

  /**
   * Delete
   */
  router.delete('/v1/car/:id', deleteCar);

  /**
   * Update one car
   */
  router.put(
    '/v1/car/:id',
    validateId,
    validateUpdate,
    findCarById, // comment this out to use  updateCarWithFindOneAndUpdate
    updateCar, // comment this out to use  updateCarWithFindOneAndUpdate
    // updateCarWithFindOneAndUpdate,
    returnCar
  );

  return router;
};
