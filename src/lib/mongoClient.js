module.exports = ({ mongoose, logger, config: { MONGO } }) => {
  /**
   * @class MongoClient class responsible for handling connection to MongoDB
   */
  class MongoClient {
    /**
     * Creates a new MongoClient instance
     */
    constructor() {
      this.connection = null;
      this.initialized = false;
      this.log = logger('MongoClient');
    }

    /**
     * Initializes the internal connection to mongo db if not already created.
     * If we fail to connect to the database, for whatever reason, we still set mongoClient to intiialized,
     * however all requests will fail. This is to ensure that the actual connection is working on start.
     * @return {Promise<boolean>}
     */
    async init() {
      if (!this.initialized) {
        const connectString = `mongodb://${MONGO.ADDRESS}:${MONGO.PORT}/${MONGO.DATABASE_NAME}`;
        let error;
        try {
          this.connection = await mongoose.connect(
            connectString,
            MONGO.OPTIONS
          );
          mongoose.connection.on('error', error => {
            this.log.error('encountered mongo error', { error });
          });
          this.log.info('successfully connected to mongo db', {
            connectString
          });
        } catch (err) {
          this.log.error('could not connect to db', {
            error: err.message,
            connectString
          });
          error = err;
        }
        this.initialized = true;
        if (error) {
          throw error;
        }
      }
      return true;
    }

    /**
     * Test the connection to mongo db by checking the connection state
     * @return {Promise<boolean>}
     */
    async test() {
      try {
        await this.init();
        const connectionState = mongoose.STATES[mongoose.connection.readyState];

        if (connectionState === 'connected') {
          return true;
        }
        throw new Error('failed to check health');
      } catch (error) {
        this.log.error('failed to check health', { error });
      }
      return false;
    }

    /**
     * Disconnect from mongoodb
     * @return {Promise<void>}
     */
    async disconnect() {
      if (this.connection) {
        try {
          await this.connection.disconnect();
        } catch (error) {
          this.log.error('failed to stop mongo connection health', { error });
        }
      }
    }
  }

  const client = new MongoClient();
  client.test();
  return client;
};
