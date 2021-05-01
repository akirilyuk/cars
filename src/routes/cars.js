module.exports = ({ express, ModelCar, httpStatus: { OK } }) => {
  const router = express.Router();

  /**
   * Get all metadata of all cars
   */
  router.get('/car', (req, res) => {
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
  router.get('/car/:id', (req, res) => {
    res.state = OK;
    res.json({});
  });

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
