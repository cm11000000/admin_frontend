/**
 * Test Script for SabPaisa COB API Login
 * Tests login with the staging credentials
 */

const https = require('https');
const crypto = require('crypto');

// Configuration - STAGING KEYS (from Angular COB-Frontend .env)
const BASE_URL = process.env.COB_BASE_URL || 'https://cobawsapi.sabpaisa.in';
const AUTH_KEY_BASE64 = '2k4Tj2NNnr98/vgJkQNKlPDvDvp3WlOyEMw59EnWweQ=';
const AUTH_IV_BASE64 = '4w9FC+U1JNF3yyHEu6zNlWjnWEeZhMV8EKyCCNeT9rSE2W5kaxO35h/mnWfGut8X';
const API_KEY = '2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69';

// Test credentials
const TEST_CREDENTIALS = {
  clientUserId: 'Abh789@sp',
  userPassword: 'P8c3@WQ7ei',
  is_social: false
};

// Encryption constants
const IV_SIZE = 12;
const TAG_SIZE = 16;
const HMAC_LENGTH = 48;

/**
 * Convert Uint8Array to hex string (uppercase)
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Encrypt using AES-256-GCM with HMAC-SHA384
 */
function encryptGCM(plaintext, keyBase64, ivBase64) {
  try {
    // Decode Base64 keys
    const authKeyBytes = Buffer.from(keyBase64, 'base64');
    const authIvBytes = Buffer.from(ivBase64, 'base64');

    // Validate key size
    if (authKeyBytes.length !== 32) {
      throw new Error(`Invalid key size: expected 32 bytes, got ${authKeyBytes.length}`);
    }

    // Generate IV from first 12 bytes of auth_key
    const ivBytes = authKeyBytes.slice(0, IV_SIZE);

    // Encrypt with AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', authKeyBytes, ivBytes);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    // Combine: IV + Ciphertext + Tag
    const encryptedMessage = Buffer.concat([
      ivBytes,
      encrypted,
      tag
    ]);

    // Calculate HMAC-SHA384
    const hmac = crypto.createHmac('sha384', authIvBytes);
    hmac.update(encryptedMessage);
    const hmacBytes = hmac.digest();

    // Final message: HMAC + IV + Ciphertext + Tag
    const finalMessage = Buffer.concat([hmacBytes, encryptedMessage]);

    // Return as HEX (uppercase)
    return bytesToHex(finalMessage);
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw error;
  }
}

/**
 * Make HTTP request
 */
function makeRequest(path, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Origin': 'https://admin.sabpaisa.in',
        'Referer': 'https://admin.sabpaisa.in/',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test 1: Login without encryption (fallback)
 */
async function testLoginPlain() {
  console.log('\n========================================');
  console.log('TEST 1: Login with Plain JSON (Fallback)');
  console.log('========================================\n');

  try {
    const loginBean = {
      clientUserId: TEST_CREDENTIALS.clientUserId,
      userPassword: TEST_CREDENTIALS.userPassword,
      is_social: TEST_CREDENTIALS.is_social
    };

    const body = {
      query: JSON.stringify(loginBean)
    };

    console.log('Request URL:', `${BASE_URL}/auth-service/auth/login`);
    console.log('Request Body:', JSON.stringify(body, null, 2));

    const response = await makeRequest('/auth-service/auth/login', 'POST', body);

    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.status) {
      console.log('\n✅ Login successful!');
      console.log('Verification Token:', response.data.verification_token);
      console.log('MFA Enabled:', response.data.is_mfa_enabled);
      return response.data;
    } else {
      console.log('\n❌ Login failed');
      return null;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 2: Login with encryption
 */
async function testLoginEncrypted() {
  console.log('\n========================================');
  console.log('TEST 2: Login with AES-256-GCM Encryption');
  console.log('========================================\n');

  try {
    const loginBean = {
      clientUserId: TEST_CREDENTIALS.clientUserId,
      userPassword: TEST_CREDENTIALS.userPassword,
      is_social: TEST_CREDENTIALS.is_social
    };

    const plaintextJson = JSON.stringify(loginBean);
    console.log('Plaintext:', plaintextJson);

    const encryptedQuery = encryptGCM(plaintextJson, AUTH_KEY_BASE64, AUTH_IV_BASE64);
    console.log('Encrypted Query (HEX):', encryptedQuery.substring(0, 50) + '...');
    console.log('Encrypted Query Length:', encryptedQuery.length);

    const body = {
      query: encryptedQuery
    };

    console.log('\nRequest URL:', `${BASE_URL}/auth-service/auth/login`);

    const response = await makeRequest('/auth-service/auth/login', 'POST', body);

    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.status) {
      console.log('\n✅ Login successful with encryption!');
      console.log('Verification Token:', response.data.verification_token);
      console.log('MFA Enabled:', response.data.is_mfa_enabled);
      return response.data;
    } else {
      console.log('\n❌ Login failed');
      return null;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 3: Login Verify (without OTP if MFA is disabled)
 */
async function testLoginVerify(verificationToken) {
  console.log('\n========================================');
  console.log('TEST 3: Login Verify (No OTP)');
  console.log('========================================\n');

  try {
    const body = {
      verification_token: verificationToken,
      otp: ''
    };

    console.log('Request URL:', `${BASE_URL}/auth-service/auth/login-verify`);
    console.log('Request Body:', JSON.stringify(body, null, 2));

    const response = await makeRequest('/auth-service/auth/login-verify', 'POST', body);

    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('\n✅ Login verification successful!');
      console.log('Access Token:', response.data.accessToken ? 'Present' : 'Missing');
      console.log('Refresh Token:', response.data.refreshToken ? 'Present' : 'Missing');
      console.log('User Name:', response.data.userName || response.data.email);
      return response.data;
    } else {
      console.log('\n❌ Login verification failed');
      return null;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return null;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     SabPaisa COB API Login Test Suite                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\nAPI URL:', BASE_URL);
  console.log('Test Credentials:', TEST_CREDENTIALS.clientUserId);
  console.log('MFA Required: No (as per user)');

  // Test 1: Plain JSON Login
  const plainResult = await testLoginPlain();

  // Test 2: Encrypted Login
  const encryptedResult = await testLoginEncrypted();

  // Test 3: Login Verify (if previous test succeeded)
  if (encryptedResult && encryptedResult.verification_token) {
    await testLoginVerify(encryptedResult.verification_token);
  } else if (plainResult && plainResult.verification_token) {
    await testLoginVerify(plainResult.verification_token);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     Test Suite Complete                                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

// Run tests
runTests().catch(console.error);
