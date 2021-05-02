module.exports = ({ logger, uuid, httpStatus }) => ({
  /**
   * Creates a local logger instance with a dedicated request context and logger for each request
   * for better tracing of the requests
   * @param req
   * @param res
   * @param next
   */
  preRequest: (req, res, next) => {
    const localLogger = logger('request', {
      requestId: uuid(),
      url: req.originalUrl || req.url,
      method: req.method
    });
    res.locals.localLogger = localLogger;
    res.locals.startTime = Date.now();

    localLogger.info('received new api request', {
      startTime: res.locals.startTime
    });
    next();
  },
  /**
   * Creates a successHandler which will be triggered after the execution of all request handles.
   * Logs the request duration, status code and
   * @param req
   * @param res
   * @param next
   */
  successHandler: (req, res, next) => {
    const {
      locals: { startTime, localLogger }
    } = res;
    const endTime = Date.now();
    const duration = endTime - startTime;

    localLogger.info('finished request', {
      duration,
      endTime,
      startTime,
      statusCode: res.statusCode
    });
    /*
       log.error('encountered api error', {
      error: { ...errorObject, stack: error.stack },
      statusCode
    });
     */
    next();
  },
  /**
   * General error handler. If an ApiError with an statusCode is provided, the request will be responses
   * with the status code, else we will assume its a general INTERNAL_SERVER_ERROR
   *
   * If the error is a client error, 4xx, we use warn as log level, for server errors error log level is used
   * @param error
   * @param req
   * @param res
   * @param next
   */
  // eslint-disable-next-line max-params
  errorHandler: (error, req, res, next) => {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const errorObject = {
      message: error.message,
      status: error.statusCode,
      code: error.errorCode
    };
    res.status(statusCode).json({
      error: errorObject
    });

    const {
      locals: { startTime, localLogger }
    } = res;
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logLevel = statusCode < 500 ? 'warn' : 'error';

    localLogger[logLevel]('finished request with error', {
      duration,
      endTime,
      startTime,
      statusCode,
      error: error.message,
      trace: error.trace || error.stack
    });

    next();
  }
});
