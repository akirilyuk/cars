module.exports = {
  GLOBAL: {
    PORT: Number(process.env.GLOBAL_PORT) || 3000,
    LOG_LEVEL:
      process.env.NODE_ENV &&
      process.env.NODE_ENV.toLowerCase() === 'production'
        ? 'info'
        : 'debug'
  },
  MONGO: {
    ADDRESS: process.env.MONGO_ADDRESS || '127.0.0.1',
    PORT: Number(process.env.MONGO_PORT) || 27017,
    DATABASE_NAME: process.env.MONGO_DATABASE_NAME || 'cars',
    OPTIONS: {
      connectTimeoutMS: Number(process.env.MONGO_CONNECTION_TIMEOUT) || 30000,
      useNewUrlParser: true,
      keepAlive: 1
    }
  }
};
