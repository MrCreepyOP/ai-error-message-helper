import assert from 'node:assert';
import {
  formatDateTime,
  formatRelativeTime,
  truncate,
  formatDiagnosisToMarkdown,
  getTechBadgeClass
} from './src/utils/formatters.js';

console.log('--- Testing Frontend Utility Functions ---');

// 1. Truncate tests
assert.strictEqual(truncate('Hello world', 5), 'Hello...');
assert.strictEqual(truncate('Short', 10), 'Short');
console.log('✓ Truncate tests passed');

// 2. Tech badge class tests
assert.strictEqual(getTechBadgeClass('JavaScript'), 'badge-js');
assert.strictEqual(getTechBadgeClass('Python'), 'badge-python');
assert.strictEqual(getTechBadgeClass('React'), 'badge-react');
assert.strictEqual(getTechBadgeClass('Java'), 'badge-java');
assert.strictEqual(getTechBadgeClass('UnknownTech'), 'badge-default');
console.log('✓ Tech badge tests passed');

// 3. Date format tests
const sampleDate = '2026-10-15T12:00:00.000Z';
const formatted = formatDateTime(sampleDate);
assert.ok(formatted.includes('2026'), 'Formatted date should contain 2026');
console.log('✓ Date formatting tests passed');

// 4. Relative time tests
const now = new Date().toISOString();
assert.strictEqual(formatRelativeTime(now), 'Just now');
console.log('✓ Relative time tests passed');

// 5. Markdown export test
const sampleEntry = {
  errorMessage: 'TypeError: Cannot read properties of undefined',
  technology: 'JavaScript',
  timestamp: sampleDate,
  diagnosis: {
    summary: 'A property was accessed on an undefined object.',
    possibleCauses: ['Object is null', 'Async state not loaded'],
    recommendedFix: ['Add optional chaining ?.'],
    codeExample: {
      originalCode: 'user.profile.name',
      correctedCode: 'user?.profile?.name',
      explanation: 'Use optional chaining to prevent crash.'
    },
    preventionTip: 'Initialize state with fallback empty objects.'
  }
};
const markdown = formatDiagnosisToMarkdown(sampleEntry);
assert.ok(markdown.includes('# AI Error Message Helper'), 'Markdown must have main title');
assert.ok(markdown.includes('### 1. What Happened?'), 'Markdown must have Section 1');
assert.ok(markdown.includes('### 2. Possible Causes'), 'Markdown must have Section 2');
assert.ok(markdown.includes('### 3. Recommended Fix'), 'Markdown must have Section 3');
assert.ok(markdown.includes('### 4. Code Example'), 'Markdown must have Section 4');
assert.ok(markdown.includes('### 5. Prevention Tip'), 'Markdown must have Section 5');
console.log('✓ Markdown formatting test passed');

console.log('\n🎉 ALL FRONTEND UTILITY TESTS PASSED SUCCESSFULLY!\n');
