module.exports = ({
  express,
  httpStatus: { OK },
  handlerCar: {
    findCarById,
    returnCar,
    updateCar,
    validateUpdate,
    validateId,
    deleteCar
    // updateCarWithFindOneAndUpdate //remove comment here to use updateCarWithFindOneAndUpdate
  }
}) => {
  const router = express.Router();

  /**
   * Get all metadata of all cars
   */
  router.get('/car', async (req, res) => {
    res.state = OK;
    res.json({});
  });

  /**
   * Create a new car
   */
  router.post('/car', (req, res) => {
    res.state = OK;

    res.json({});
  });

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
