require('dotenv').config({
  path: `.env.${process.env.NODE_ENV.toLowerCase()}`
});

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
    USERNAME: process.env.MONGO_USER_NAME || 'user',
    PASSWORD: process.env.MONGO_USER_PASSWORD || 'password',
    ADDRESS: process.env.MONGO_ADDRESS || 'localhost',
    PORT: Number(process.env.MONGO_PORT) || 37017,
    DATABASE_NAME: process.env.MONGO_DATABASE_NAME || 'cars',
    OPTIONS: {
      connectTimeoutMS: Number(process.env.MONGO_CONNECTION_TIMEOUT) || 30000,
      useNewUrlParser: true
    }
  }
};
