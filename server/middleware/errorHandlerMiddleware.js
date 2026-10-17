/**
 * Centralized Error Handling Middleware
 */
function errorHandlerMiddleware(err, req, res, next) {
  // Safe logging without leaking sensitive keys
  console.error('[API Server Error]:', err.message || err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred while processing your request.',
    code: errorCode,
    help: err.help || undefined
  });
}

/**
 * 404 Route Not Found Middleware
 */
function notFoundMiddleware(req, res) {
  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND'
  });
}

module.exports = {
  errorHandlerMiddleware,
  notFoundMiddleware
};
