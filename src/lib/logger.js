module.exports = ({ winston, config: GLOBAL }) => (name, context) => {
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
