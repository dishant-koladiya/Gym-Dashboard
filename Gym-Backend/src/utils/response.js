/**
 * Standard success response helper.
 * @param {Object} res Express response object
 * @param {String} message Custom message describing success
 * @param {Object|Array|null} data Response payload
 * @param {Number} statusCode HTTP status code (default: 200)
 */
const sendSuccess = (res, message = "Success", data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard error response helper.
 * @param {Object} res Express response object
 * @param {String} message Error message
 * @param {Number} statusCode HTTP status code (default: 500)
 * @param {Object|Array|null} errors Additional validation error details or errors list
 */
const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
