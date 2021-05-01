module.exports = ({
  express,
  httpStatus: { OK },
  handlerCar: { findCarById }
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
  router.get('/car/:id', findCarById);

  /**
   * Delete
   */
  router.delete('/car/:id', (req, res) => {
    res.state = OK;
    res.json({});
  });

  /**
   * Update one car
   */
  router.put('/car/:id', (req, res) => {
    res.state = OK;
    res.json({});
  });

  return router;
};
