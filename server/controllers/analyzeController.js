const { analyzeError } = require('../services/geminiService');

/**
 * Controller to handle POST /api/analyze requests
 */
async function analyzeErrorController(req, res, next) {
  try {
    const { errorMessage, technology, context } = req.body;

    const diagnosis = await analyzeError({
      errorMessage,
      technology,
      context
    });

    return res.status(200).json({
      success: true,
      data: diagnosis,
      metadata: {
        technology,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeErrorController
};
