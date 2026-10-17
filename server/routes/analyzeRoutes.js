const express = require('express');
const router = express.Router();
const { analyzeErrorController } = require('../controllers/analyzeController');
const { validateAnalyzeRequest } = require('../middleware/validationMiddleware');

// POST /api/analyze
router.post('/', validateAnalyzeRequest, analyzeErrorController);

module.exports = router;
