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
     * Initializes the internal connection to mongo db if not already created
     * @return {Promise<boolean>}
     */
    async init() {
      if (!this.initialized) {
        const connectString = `mongodb://${MONGO.ADDRESS}:${MONGO.PORT}/${MONGO.DATABASE_NAME}`;
        try {
          this.connection = await mongoose.connect(
            connectString,
            MONGO.OPTIONS
          );
          mongoose.connection.on('error', error => {
            this.log.error('encountered mongo error', { error });
          });
          this.initialized = true;
          this.log.info('successfully connected to mongo db', {
            connectString
          });
        } catch (error) {
          this.log.error('could not connect to db', {
            error: error.message,
            connectString
          });
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

  return new MongoClient();
};
