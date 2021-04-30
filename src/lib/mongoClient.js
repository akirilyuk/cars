module.exports = ({ mongoose, logger, config: { MONGO } }) => {
  class MongoClient {
    constructor() {
      this.connection = null;
      this.initialized = false;
      this.log = logger('MongoClient');
    }

    async init() {
      if (!this.initialized) {
        const connectString = `mongodb://${MONGO.USERNAME}:${MONGO.PASSWORD}@${MONGO.ADDRESS}:${MONGO.PORT}/${MONGO.DATABASE_NAME}`;
        this.connection = await mongoose.connect(connectString, MONGO.OPTIONS);
        mongoose.connection.on('error', error => {
          this.log.error('encountered mongo error', { error });
        });
      }
      return true;
    }

    async test() {
      try {
        await this.init();
        const result = await mongoose.connection.db.admin().ping();

        if (result && result.ok === 1) {
          return true;
        }
        throw new Error('failed to check health');
      } catch (error) {
        this.log.error('failed to check health', { error });
      }
      return false;
    }
  }
  return new MongoClient();
};
