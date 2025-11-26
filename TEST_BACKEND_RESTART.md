# 🔧 Backend Restart Required

## Problem
The error shows **404 Not Found** for `/api/auth/register` because:
1. Backend server is running with OLD auth routes (phone-based)
2. New auth routes (email-based) are not loaded yet

## Solution: Restart Backend

### Step 1: Stop Backend
If backend is running in a terminal, press `Ctrl + C`

### Step 2: Start Backend
```bash
cd backend
npm start
```

### Step 3: Verify Backend Started
You should see:
```
✅ MongoDB Connected
🚀 Backend running on port 5000
```

### Step 4: Test Registration Again
1. Refresh browser (F5)
2. Try registering again
3. Should work now!

## Quick Test

Open a new terminal and test the endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Should return:
```json
{
  "ok": true,
  "message": "Verification code sent to your email",
  "demoOtp": "123456"
}
```

## If Still Getting 404

Check backend console for errors:
- Import errors
- Syntax errors
- Module not found errors

## Common Issues

### Issue 1: nodemailer not installed
```bash
cd backend
npm install nodemailer
```

### Issue 2: Old auth.js cached
Delete `node_modules` and reinstall:
```bash
cd backend
rmdir /s /q node_modules
npm install
npm start
```

### Issue 3: Wrong route path
Check `backend/server.js` line 119:
```javascript
app.use('/api/auth', authRoutes);
```

Should be there and uncommented.
