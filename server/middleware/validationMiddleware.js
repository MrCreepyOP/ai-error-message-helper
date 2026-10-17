const { MAX_ERROR_LENGTH, SUPPORTED_TECHNOLOGIES } = require('../utils/constants');

/**
 * Middleware to validate error analysis request payload
 */
function validateAnalyzeRequest(req, res, next) {
  const { errorMessage, technology, context } = req.body;

  // Validate presence and type of errorMessage
  if (!errorMessage || typeof errorMessage !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Error message is required and must be a text string.',
      code: 'INVALID_ERROR_MESSAGE'
    });
  }

  const trimmedError = errorMessage.trim();
  if (trimmedError.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Error message cannot be empty or only whitespace.',
      code: 'EMPTY_ERROR_MESSAGE'
    });
  }

  if (trimmedError.length > MAX_ERROR_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Error message exceeds maximum limit of ${MAX_ERROR_LENGTH} characters (currently ${trimmedError.length} characters).`,
      code: 'ERROR_MESSAGE_TOO_LONG'
    });
  }

  // Validate technology selection (default to 'Other / Unknown' if omitted or invalid)
  if (!technology || typeof technology !== 'string') {
    req.body.technology = 'Other / Unknown';
  } else {
    // Normalize or match against supported list
    const matched = SUPPORTED_TECHNOLOGIES.find(
      (tech) => tech.toLowerCase() === technology.trim().toLowerCase()
    );
    req.body.technology = matched || technology.trim();
  }

  // Validate optional additional context
  if (context && typeof context === 'string' && context.length > MAX_ERROR_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Context snippet exceeds maximum limit of ${MAX_ERROR_LENGTH} characters.`,
      code: 'CONTEXT_TOO_LONG'
    });
  }

  req.body.errorMessage = trimmedError;
  next();
}

module.exports = {
  validateAnalyzeRequest
};
