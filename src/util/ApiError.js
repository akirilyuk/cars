module.exports = class ApiError extends Error {
  constructor(originalError = {}, errorCode, statusCode) {
    super(originalError.message);
    this.stack = originalError.stack;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
};
