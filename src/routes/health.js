module.exports = ({
  express,
  httpStatus: { OK, INTERNAL_SERVER_ERROR },
  mongoClient
}) => {
  const router = express.Router();

  /**
   * get current service health
   */
  router.get('/current', async (req, res) => {
    const healthy = await mongoClient.test();
    res.state = healthy ? OK : INTERNAL_SERVER_ERROR;

    res.json({ mongo: { healthy } });
  });

  return router;
};