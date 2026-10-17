/**
 * Health check controller
 */
function getHealth(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(
    apiKey &&
    apiKey.trim() !== '' &&
    apiKey !== 'your_gemini_api_key_here'
  );

  return res.status(200).json({
    status: 'healthy',
    message: 'AI Error Message Helper backend is running.',
    uptime: Math.floor(process.uptime()),
    geminiConfigured: isConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHealth
};
