// Quick API Endpoint Test Script
// Run this with: node test-api-endpoints.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const endpoints = [
  { method: 'GET', path: '/', description: 'Health Check' },
  { method: 'POST', path: '/auth/send-otp', description: 'Send OTP' },
  { method: 'POST', path: '/auth/verify-otp', description: 'Verify OTP' },
  { method: 'GET', path: '/users/me', description: 'Get User Profile', requiresAuth: true },
  { method: 'GET', path: '/feed', description: 'Get Feed', requiresAuth: true },
  { method: 'POST', path: '/interactions', description: 'Post Interaction', requiresAuth: true },
  { method: 'GET', path: '/matches', description: 'Get Matches', requiresAuth: true },
  { method: 'GET', path: '/messages', description: 'Get Conversations', requiresAuth: true },
  { method: 'GET', path: '/friends', description: 'Get Friends', requiresAuth: true },
  { method: 'GET', path: '/friends/requests', description: 'Get Friend Requests', requiresAuth: true },
  { method: 'POST', path: '/requests/phone-access', description: 'Request Phone Access', requiresAuth: true },
  { method: 'GET', path: '/gifts', description: 'Get Gifts', requiresAuth: true },
  { method: 'GET', path: '/boosts', description: 'Get Boosts', requiresAuth: true },
  { method: 'GET', path: '/referrals', description: 'Get Referrals', requiresAuth: true },
];

async function testEndpoint(endpoint) {
  try {
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 5000,
    };

    if (endpoint.requiresAuth) {
      // Skip auth-required endpoints for now
      console.log(`⚠️  ${endpoint.method} ${endpoint.path} - ${endpoint.description} (Requires Auth - Skipped)`);
      return;
    }

    const response = await axios(config);
    console.log(`✅ ${endpoint.method} ${endpoint.path} - ${endpoint.description} (${response.status})`);
  } catch (error) {
    if (error.response) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${endpoint.description} (${error.response.status})`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`🔌 ${endpoint.method} ${endpoint.path} - ${endpoint.description} (Server not running)`);
    } else {
      console.log(`❓ ${endpoint.method} ${endpoint.path} - ${endpoint.description} (${error.message})`);
    }
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n📋 Test Summary:');
  console.log('✅ = Working');
  console.log('❌ = Error (check implementation)');
  console.log('⚠️  = Requires Authentication (normal)');
  console.log('🔌 = Server not running');
  console.log('\n💡 To test authenticated endpoints, use the frontend app or Postman with valid tokens.');
}

runTests();