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
    getCars
    // updateCarWithFindOneAndUpdate //remove comment here to use updateCarWithFindOneAndUpdate
  }
}) => {
  const router = express.Router();

  /**
   * Get all metadata of all cars
   */
  router.get('/car', getCars);

  /**
   * Create a new car
   */
  router.post('/car', validateCreate, createCar);

  /**
   * Get car by ID
   */
  router.get('/car/:id', findCarById, returnCar);

  /**
   * Delete
   */
  router.delete('/car/:id', deleteCar);

  /**
   * Update one car
   */
  router.put(
    '/car/:id',
    validateId,
    validateUpdate,
    findCarById, // comment this out to use  updateCarWithFindOneAndUpdate
    updateCar, // comment this out to use  updateCarWithFindOneAndUpdate
    // updateCarWithFindOneAndUpdate,
    returnCar
  );

  return router;
};
