const http = require('http');
const app = require('./server');

const server = app.listen(5099, async () => {
  console.log('Testing server running on 5099...');

  try {
    // 1. Healthcheck
    const health = await request('GET', '/api/health');
    console.log('✓ /api/health:', health.status);

    // 2. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@storehub.com',
      password: 'Admin@123'
    });
    console.log('✓ Admin login successful! Role:', adminLogin.user.role);
    const adminToken = adminLogin.token;

    // 3. Admin Dashboard stats
    const stats = await request('GET', '/api/admin/dashboard', null, adminToken);
    console.log('✓ Admin dashboard stats:', stats);

    // 4. Normal User Login
    const userLogin = await request('POST', '/api/auth/login', {
      email: 'user.benjamin@storehub.com',
      password: 'User@123'
    });
    console.log('✓ Normal User login successful! Role:', userLogin.user.role);
    const userToken = userLogin.token;

    // 5. Stores Catalog
    const stores = await request('GET', '/api/stores', null, userToken);
    console.log(`✓ User stores catalog returned ${stores.stores.length} stores`);

    // 6. Store Owner Login
    const ownerLogin = await request('POST', '/api/auth/login', {
      email: 'owner.robert@storehub.com',
      password: 'Owner@123'
    });
    console.log('✓ Store Owner login successful! Role:', ownerLogin.user.role);
    const ownerToken = ownerLogin.token;

    // 7. Store Owner Dashboard
    const ownerDash = await request('GET', '/api/stores/owner/dashboard', null, ownerToken);
    console.log(`✓ Store Owner dashboard loaded: Store=${ownerDash.store.name}, AvgRating=${ownerDash.store.averageRating}, Reviews=${ownerDash.raters.length}`);

    console.log('\n--- ALL E2E VERIFICATIONS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Verification error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
});

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5099,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}
