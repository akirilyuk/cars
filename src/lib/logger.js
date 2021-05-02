module.exports = ({ winston, config: GLOBAL }) =>
  /**
   * Cretes a new logger instance with the desired name and also default logging context
   * @param name {string} name of your logger
   * @param context {object} additional logging context which will be printed with all logs of this logger instance
   * @return {Logger}
   */
  (name, context = {}) => {
    return winston.createLogger({
      level: GLOBAL.LOG_LEVEL,
      defaultMeta: { loggerContext: name, ...context },
      transports: [
        new winston.transports.Console({
          level: GLOBAL.LOG_LEVEL,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          prettyPrint: true
        })
      ]
    });
  };
