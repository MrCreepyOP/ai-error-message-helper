const { GoogleGenerativeAI } = require('@google/generative-ai');
const { DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODEL } = require('../utils/constants');

/**
 * System instruction and schema definition for Gemini
 */
const SYSTEM_INSTRUCTION = `
You are an expert AI debugging assistant and senior developer mentor.
Your task is to analyze programming errors, exceptions, stack traces, and compiler diagnostics, and provide a clear, beginner-friendly, structured 5-part diagnosis.

You MUST respond strictly with valid JSON conforming to this exact structure:
{
  "summary": "Clear, beginner-friendly plain-English explanation of what the error means without unnecessary jargon.",
  "possibleCauses": [
    "Most likely root cause",
    "Second possible root cause",
    "Third possible root cause (if applicable)"
  ],
  "recommendedFix": [
    "Step 1: Concrete action to resolve the issue",
    "Step 2: Next troubleshooting or fix step",
    "Step 3: Verification step"
  ],
  "codeExample": {
    "applicable": true,
    "originalCode": "// Problematic or problematic illustrative code showing the bug",
    "correctedCode": "// Corrected code showing the fix in place",
    "explanation": "Brief explanation of what changed between the buggy and corrected code and why."
  },
  "preventionTip": "Practical best practice, defensive coding pattern, or testing habit to prevent this error in the future."
}

CRITICAL RULES:
1. Do not invent the user's specific application code if not provided. When the user pastes only an error message without source code, set "applicable" to true and provide a clearly labeled, realistic illustrative before-and-after example showing typical code that triggers this error.
2. In "possibleCauses", list 2 to 4 plausible root causes ordered by relevance. Do not pretend certainty when details are ambiguous.
3. In "recommendedFix", provide concrete, step-by-step numbered instructions that a beginner can follow.
4. "preventionTip" should be an actionable habit or best practice (e.g. optional chaining, null checks, environment variable validation, typing, unit testing).
5. Output ONLY raw JSON. Do not include markdown code block syntax (like \`\`\`json) outside the JSON.
`;

/**
 * Clean and parse JSON text safely from LLM output
 */
function cleanAndParseJSON(rawText) {
  let cleaned = rawText.trim();
  // Strip markdown code fences if Gemini included them
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt relaxed regex extraction if extra text surrounds the JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse AI response into structured JSON. Output was malformed.');
  }
}

/**
 * Validate and normalize diagnosis schema to guarantee contract
 */
function normalizeDiagnosis(data, technology) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid diagnosis payload format.');
  }

  const summary = typeof data.summary === 'string' && data.summary.trim().length > 0
    ? data.summary.trim()
    : 'An error occurred during execution in ' + (technology || 'your code') + '.';

  const possibleCauses = Array.isArray(data.possibleCauses) && data.possibleCauses.length > 0
    ? data.possibleCauses.filter((c) => typeof c === 'string' && c.trim().length > 0)
    : ['Unexpected state or invalid variable reference.', 'Missing or misconfigured dependency.'];

  const recommendedFix = Array.isArray(data.recommendedFix) && data.recommendedFix.length > 0
    ? data.recommendedFix.filter((f) => typeof f === 'string' && f.trim().length > 0)
    : ['Check where the variable or resource is initialized before it is accessed.', 'Inspect the stack trace for line numbers.'];

  const codeExample = (data.codeExample && typeof data.codeExample === 'object') ? {
    applicable: data.codeExample.applicable !== false,
    originalCode: typeof data.codeExample.originalCode === 'string' ? data.codeExample.originalCode : '',
    correctedCode: typeof data.codeExample.correctedCode === 'string' ? data.codeExample.correctedCode : '',
    explanation: typeof data.codeExample.explanation === 'string' ? data.codeExample.explanation : 'Compare the before and after implementations above.'
  } : {
    applicable: false,
    originalCode: '',
    correctedCode: '',
    explanation: 'Code example not applicable for this diagnostic.'
  };

  const preventionTip = typeof data.preventionTip === 'string' && data.preventionTip.trim().length > 0
    ? data.preventionTip.trim()
    : 'Implement automated unit tests and defensive null/type checks in your codebase.';

  return {
    summary,
    possibleCauses,
    recommendedFix,
    codeExample,
    preventionTip
  };
}

/**
 * Service to analyze errors using Google Gemini
 */
async function analyzeError({ errorMessage, technology, context }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    const error = new Error(
      'Google Gemini API Key is not configured. Please add your GEMINI_API_KEY to server/.env file. ' +
      'You can obtain a free API key at https://aistudio.google.com/.'
    );
    error.statusCode = 503;
    error.code = 'API_KEY_NOT_CONFIGURED';
    error.help = 'Open server/.env and replace your_gemini_api_key_here with your active Gemini API key from Google AI Studio.';
    throw error;
  }

  const primaryModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey.trim());

  const promptContent = `
Technology / Ecosystem: ${technology || 'General / Unknown'}
Error Message or Stack Trace:
"""
${errorMessage}
"""
${context ? `Additional Context or Surrounding Code:\n"""\n${context}\n"""` : ''}

Please analyze this error thoroughly and return the 5-part diagnosis strictly as JSON.
`;

  // Function to execute generation with a specific model name
  const callModel = async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const result = await model.generateContent(promptContent);
    const response = await result.response;
    return response.text();
  };

  let rawResponseText;
  try {
    rawResponseText = await callModel(primaryModel);
  } catch (err) {
    console.warn(`[Gemini Service] Primary model ${primaryModel} failed: ${err.message}`);

    // If model wasn't found or is deprecated, try fallback model
    if (primaryModel !== FALLBACK_GEMINI_MODEL && (
      err.message.includes('404') ||
      err.message.toLowerCase().includes('not found') ||
      err.message.toLowerCase().includes('unsupported model')
    )) {
      console.info(`[Gemini Service] Retrying with fallback model: ${FALLBACK_GEMINI_MODEL}...`);
      try {
        rawResponseText = await callModel(FALLBACK_GEMINI_MODEL);
      } catch (fallbackErr) {
        handleGeminiApiError(fallbackErr);
      }
    } else {
      handleGeminiApiError(err);
    }
  }

  // Parse and validate structured output
  try {
    const parsed = cleanAndParseJSON(rawResponseText);
    const validated = normalizeDiagnosis(parsed, technology);
    return validated;
  } catch (parseErr) {
    console.error('[Gemini Service] JSON parse/validation error:', parseErr.message, '\nRaw text was:', rawResponseText);
    const err = new Error('The AI generated an unparseable response structure. Please retry the analysis.');
    err.statusCode = 502;
    err.code = 'MALFORMED_AI_RESPONSE';
    throw err;
  }
}

/**
 * Categorize and translate Gemini API errors into friendly client responses
 */
function handleGeminiApiError(err) {
  const msg = err.message || '';
  const error = new Error();

  if (msg.includes('API_KEY_INVALID') || msg.includes('400') && msg.toLowerCase().includes('api key')) {
    error.message = 'The provided Google Gemini API Key is invalid or expired. Please check your server/.env file.';
    error.statusCode = 401;
    error.code = 'INVALID_API_KEY';
  } else if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.toLowerCase().includes('quota')) {
    error.message = 'Gemini API quota or rate limit has been exceeded. Please wait a minute and try again, or check your Google AI Studio quota.';
    error.statusCode = 429;
    error.code = 'QUOTA_EXCEEDED';
  } else if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
    error.message = 'Failed to connect to Google Gemini API servers. Please check your internet connection.';
    error.statusCode = 503;
    error.code = 'NETWORK_ERROR';
  } else {
    error.message = `AI Analysis service error: ${msg.replace(/API_KEY=[^&]+/gi, 'API_KEY=***')}`;
    error.statusCode = 500;
    error.code = 'GEMINI_API_ERROR';
  }

  throw error;
}

module.exports = {
  analyzeError
};
