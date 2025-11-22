#!/usr/bin/env node

// Simple test runner for HumDono Dating App
// Run with: node run-tests.js

const fs = require('fs');
const path = require('path');

console.log('🧪 HumDono Dating App - Automated Tests\n');

// Test 1: Check if all required files exist
console.log('📁 File Structure Tests:');

const requiredFiles = [
  'backend/server.js',
  'backend/routes/auth.js',
  'backend/routes/users.js',
  'backend/routes/friends.js',
  'backend/routes/messages.js',
  'backend/routes/requests.js',
  'frontend/src/App.jsx',
  'frontend/src/components/SwipeCard.jsx',
  'frontend/src/components/Navigation.jsx',
  'frontend/src/pages/HomeFeed.jsx',
  'frontend/src/pages/Chat.jsx',
  'frontend/src/pages/Friends.jsx',
  'frontend/src/lib/api.js',
  'frontend/public/Fonts/ARLRDBD.TTF'
];

let filesExist = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    filesExist++;
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log(`\n📊 Files: ${filesExist}/${requiredFiles.length} exist\n`);

// Test 2: Check package.json dependencies
console.log('📦 Dependency Tests:');

try {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  const requiredBackendDeps = ['express', 'mongoose', 'cors', 'dotenv', 'multer', 'cloudinary'];
  const requiredFrontendDeps = ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'axios'];
  
  console.log('Backend Dependencies:');
  requiredBackendDeps.forEach(dep => {
    if (backendPkg.dependencies && backendPkg.dependencies[dep]) {
      console.log(`✅ ${dep}: ${backendPkg.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
  
  console.log('\nFrontend Dependencies:');
  requiredFrontendDeps.forEach(dep => {
    if (frontendPkg.dependencies && frontendPkg.dependencies[dep]) {
      console.log(`✅ ${dep}: ${frontendPkg.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
  
} catch (error) {
  console.log('❌ Error reading package.json files');
}

// Test 3: Check environment configuration
console.log('\n🔧 Configuration Tests:');

if (fs.existsSync('backend/.env')) {
  console.log('✅ Backend .env file exists');
  try {
    const envContent = fs.readFileSync('backend/.env', 'utf8');
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME'];
    
    requiredEnvVars.forEach(envVar => {
      if (envContent.includes(envVar)) {
        console.log(`✅ ${envVar} configured`);
      } else {
        console.log(`❌ ${envVar} - MISSING`);
      }
    });
  } catch (error) {
    console.log('❌ Error reading .env file');
  }
} else {
  console.log('❌ Backend .env file missing');
}

// Test 4: Check for common code issues
console.log('\n🔍 Code Quality Tests:');

try {
  // Check for console.log in production files (should be minimal)
  const swipeCardContent = fs.readFileSync('frontend/src/components/SwipeCard.jsx', 'utf8');
  const homeFeedContent = fs.readFileSync('frontend/src/pages/HomeFeed.jsx', 'utf8');
  
  if (swipeCardContent.includes('console.log')) {
    console.log('⚠️  SwipeCard contains console.log statements');
  } else {
    console.log('✅ SwipeCard - No debug logs');
  }
  
  if (homeFeedContent.includes('console.log')) {
    console.log('⚠️  HomeFeed contains console.log statements');
  } else {
    console.log('✅ HomeFeed - No debug logs');
  }
  
  // Check for proper error handling
  if (homeFeedContent.includes('try {') && homeFeedContent.includes('catch')) {
    console.log('✅ HomeFeed - Has error handling');
  } else {
    console.log('⚠️  HomeFeed - Missing error handling');
  }
  
} catch (error) {
  console.log('❌ Error analyzing code files');
}

// Test 5: Font file check
console.log('\n🎨 Font Tests:');

if (fs.existsSync('frontend/public/Fonts/ARLRDBD.TTF')) {
  const fontStats = fs.statSync('frontend/public/Fonts/ARLRDBD.TTF');
  console.log(`✅ Custom font exists (${Math.round(fontStats.size / 1024)}KB)`);
} else {
  console.log('❌ Custom font file missing');
}

// Check CSS for font definition
try {
  const cssContent = fs.readFileSync('frontend/src/index.css', 'utf8');
  if (cssContent.includes('@font-face') && cssContent.includes('ARLRDBD')) {
    console.log('✅ Font properly defined in CSS');
  } else {
    console.log('❌ Font not properly defined in CSS');
  }
} catch (error) {
  console.log('❌ Error reading CSS file');
}

console.log('\n🎯 Test Summary:');
console.log('✅ = Pass');
console.log('❌ = Fail (needs attention)');
console.log('⚠️  = Warning (should check)');

console.log('\n🚀 Next Steps:');
console.log('1. Start backend: cd backend && npm start');
console.log('2. Start frontend: cd frontend && npm run dev');
console.log('3. Open browser: http://localhost:5173');
console.log('4. Follow CRITICAL_TESTS.md for manual testing');

console.log('\n💡 For detailed testing, see:');
console.log('- TESTING_GUIDE.md (comprehensive guide)');
console.log('- CRITICAL_TESTS.md (priority tests)');