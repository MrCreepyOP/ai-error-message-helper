const http = require('http');
const app = require('./server');

const testPort = 5099;
const server = app.listen(testPort, async () => {
  console.log(`Test server running on port ${testPort}`);

  function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: testPort,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload ? Buffer.byteLength(payload) : 0
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    console.log('\n--- Test 1: GET /api/health ---');
    const health = await makeRequest('/api/health');
    console.log('Health status:', health.status, 'Response:', health.data);
    if (health.status !== 200 || health.data.status !== 'healthy') throw new Error('Health check failed');
    console.log('✓ Test 1 Passed');

    console.log('\n--- Test 2: POST /api/analyze (Empty body) ---');
    const emptyAnalyze = await makeRequest('/api/analyze', 'POST', { errorMessage: '' });
    console.log('Empty analyze status:', emptyAnalyze.status, 'Code:', emptyAnalyze.data.code);
    if (emptyAnalyze.status !== 400) throw new Error('Empty analyze check failed');
    console.log('✓ Test 2 Passed');

    console.log('\n--- Test 3: POST /api/analyze (Over 5000 characters) ---');
    const tooLongAnalyze = await makeRequest('/api/analyze', 'POST', { errorMessage: 'a'.repeat(5001) });
    console.log('Too long status:', tooLongAnalyze.status, 'Code:', tooLongAnalyze.data.code);
    if (tooLongAnalyze.status !== 400 || tooLongAnalyze.data.code !== 'ERROR_MESSAGE_TOO_LONG') throw new Error('Length check failed');
    console.log('✓ Test 3 Passed');

    console.log('\n--- Test 4: POST /api/analyze (Valid key / Analysis flow) ---');
    const origKey = process.env.GEMINI_API_KEY;
    // Temporarily unset key to test 503 error handling
    delete process.env.GEMINI_API_KEY;
    const noKeyAnalyze = await makeRequest('/api/analyze', 'POST', { errorMessage: 'TypeError: undefined', technology: 'JavaScript' });
    console.log('No key status:', noKeyAnalyze.status, 'Code:', noKeyAnalyze.data.code);
    if (noKeyAnalyze.status !== 503 || noKeyAnalyze.data.code !== 'API_KEY_NOT_CONFIGURED') throw new Error('API key check failed');
    process.env.GEMINI_API_KEY = origKey;
    console.log('✓ Test 4 Passed');

    console.log('\n--- Test 5: GET /api/nonexistent (404 Route) ---');
    const notFound = await makeRequest('/api/nonexistent');
    console.log('404 status:', notFound.status, 'Code:', notFound.data.code);
    if (notFound.status !== 404 || notFound.data.code !== 'ROUTE_NOT_FOUND') throw new Error('404 check failed');
    console.log('✓ Test 5 Passed');

    console.log('\n🎉 ALL 5 BACKEND TESTS PASSED SUCCESSFULLY!\n');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('❌ Test failure:', err);
    server.close(() => process.exit(1));
  }
});
