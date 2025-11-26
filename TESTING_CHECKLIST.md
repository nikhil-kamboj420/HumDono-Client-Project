# ✅ Email Authentication Testing Checklist

## Pre-Testing Setup

### 1. Backend Configuration
- [x] nodemailer installed
- [ ] EMAIL_USER configured in backend/.env
- [ ] EMAIL_PASS configured in backend/.env
- [ ] MongoDB running and connected
- [ ] Backend server started (npm start)

### 2. Frontend Configuration
- [ ] Frontend server started (npm run dev)
- [ ] Browser opened to http://localhost:5173

## Test Scenarios

### Scenario 1: New User Registration ✅

**Steps:**
1. [ ] Open http://localhost:5173
2. [ ] Should redirect to `/login`
3. [ ] Click "Sign Up" link
4. [ ] Fill registration form:
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
5. [ ] Click "Sign Up" button
6. [ ] Should redirect to `/verify-registration`
7. [ ] Check email for OTP (or console for demoOtp)
8. [ ] Enter 6-digit OTP
9. [ ] Click "Verify & Continue"
10. [ ] Should redirect to `/profile/create`

**Expected Results:**
- ✅ Registration form validates inputs
- ✅ OTP sent to email
- ✅ User account created after verification
- ✅ User redirected to profile creation

**Common Issues:**
- ❌ "Email already registered" → User exists, try different email
- ❌ "Failed to send email" → Check EMAIL_USER/EMAIL_PASS
- ❌ "OTP expired" → OTP valid for 5 minutes only

---

### Scenario 2: User Login ✅

**Steps:**
1. [ ] Go to `/login`
2. [ ] Enter credentials:
   - Email: test@example.com
   - Password: password123
3. [ ] Click "Login" button
4. [ ] Should redirect to `/` or `/profile/create`

**Expected Results:**
- ✅ Login successful with correct credentials
- ✅ JWT token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Redirected based on profile completion

**Common Issues:**
- ❌ "Invalid email or password" → Check credentials
- ❌ "User not found" → Register first

---

### Scenario 3: OTP Resend ✅

**Steps:**
1. [ ] Register new user
2. [ ] On verification page, wait 1 minute
3. [ ] Click "Resend" link
4. [ ] Check email for new OTP

**Expected Results:**
- ✅ New OTP generated
- ✅ Old OTP invalidated
- ✅ New OTP sent to email

---

### Scenario 4: Invalid OTP ✅

**Steps:**
1. [ ] Register new user
2. [ ] Enter wrong OTP (e.g., 000000)
3. [ ] Click "Verify & Continue"
4. [ ] Try 5 times

**Expected Results:**
- ✅ "Incorrect OTP" error shown
- ✅ After 5 attempts: "Too many attempts"
- ✅ Must resend OTP to try again

---

### Scenario 5: Expired OTP ✅

**Steps:**
1. [ ] Register new user
2. [ ] Wait 6 minutes (OTP expires in 5 minutes)
3. [ ] Try to verify with OTP

**Expected Results:**
- ✅ "OTP expired" error shown
- ✅ Must resend OTP

---

### Scenario 6: Duplicate Email ✅

**Steps:**
1. [ ] Register user with email: test@example.com
2. [ ] Complete verification
3. [ ] Try to register again with same email

**Expected Results:**
- ✅ "Email already registered" error shown
- ✅ Suggested to login instead

---

### Scenario 7: Password Validation ✅

**Steps:**
1. [ ] Try to register with password: "12345" (too short)
2. [ ] Try with mismatched passwords

**Expected Results:**
- ✅ "Password must be at least 6 characters"
- ✅ "Passwords do not match"

---

### Scenario 8: Email Validation ✅

**Steps:**
1. [ ] Try to register with invalid emails:
   - "notanemail"
   - "test@"
   - "@example.com"

**Expected Results:**
- ✅ "Invalid email format" error shown

---

### Scenario 9: Session Persistence ✅

**Steps:**
1. [ ] Login successfully
2. [ ] Close browser tab
3. [ ] Open new tab to http://localhost:5173
4. [ ] Should stay logged in

**Expected Results:**
- ✅ User stays logged in
- ✅ Token persists in localStorage
- ✅ Refresh token works

---

### Scenario 10: Logout ✅

**Steps:**
1. [ ] Login successfully
2. [ ] Navigate to settings or profile
3. [ ] Click logout
4. [ ] Should redirect to `/login`

**Expected Results:**
- ✅ User logged out
- ✅ Token removed from localStorage
- ✅ Refresh token invalidated
- ✅ Redirected to login page

---

## Backend API Testing

### Test with cURL or Postman

#### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Verification code sent to your email",
  "demoOtp": "123456"
}
```

#### 2. Verify Registration
```bash
curl -X POST http://localhost:5000/api/auth/verify-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","otp":"123456"}'
```

**Expected Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "test@example.com",
    "coins": 0
  },
  "isNewUser": true,
  "isProfileComplete": false
}
```

#### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 4. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Verification

### Check MongoDB

```javascript
// Connect to MongoDB
use humdonoDB

// Check users collection
db.users.find({ email: "test@example.com" })

// Should see:
{
  "_id": ObjectId("..."),
  "email": "test@example.com",
  "password": "$2a$10$...", // hashed
  "coins": 0,
  "requiresFirstSubscription": true,
  "verification": {
    "emailVerified": true
  }
}

// Check OTP collection (should be empty after verification)
db.otps.find({ email: "test@example.com" })
```

---

## Email Service Testing

### Gmail Setup Verification

1. [ ] 2FA enabled on Gmail account
2. [ ] App Password generated
3. [ ] EMAIL_USER = your-email@gmail.com
4. [ ] EMAIL_PASS = 16-digit app password (no spaces)

### Test Email Sending

```javascript
// In backend console or create test file
import { sendOtpEmail } from './utils/emailService.js';

await sendOtpEmail('test@example.com', '123456');
// Should see: ✅ OTP email sent: <message-id>
```

---

## Performance Testing

### Load Testing
- [ ] Register 10 users simultaneously
- [ ] Login 10 users simultaneously
- [ ] Send 10 OTPs simultaneously

**Expected:**
- ✅ All requests complete within 2 seconds
- ✅ No database errors
- ✅ No email service errors

---

## Security Testing

### Password Security
- [ ] Passwords are hashed (check database)
- [ ] Passwords never returned in API responses
- [ ] Password validation enforced (min 6 chars)

### Token Security
- [ ] JWT tokens expire after 1 hour
- [ ] Refresh tokens expire after 30 days
- [ ] Refresh tokens are httpOnly cookies
- [ ] Tokens invalidated on logout

### OTP Security
- [ ] OTP expires after 5 minutes
- [ ] OTP attempts limited to 5
- [ ] OTP is hashed in database
- [ ] Old OTPs deleted after verification

---

## Browser Console Checks

### No Errors
```
✅ No red error messages
✅ API calls return 200/201 status
✅ No CORS errors
✅ No authentication errors
```

### Expected Logs (Development)
```
Demo OTP: 123456
✅ User registered successfully
✅ Login successful
✅ Token saved
```

---

## Production Readiness

Before deploying to production:

- [ ] Remove demoOtp from API responses
- [ ] Set NODE_ENV=production
- [ ] Configure production email service
- [ ] Test email delivery in production
- [ ] Set up email monitoring
- [ ] Add rate limiting on auth endpoints
- [ ] Add CAPTCHA on registration
- [ ] Set up error tracking (Sentry)
- [ ] Add password reset functionality
- [ ] Add email change functionality

---

## Troubleshooting Guide

### Issue: "Failed to send email"
**Solution:**
1. Check EMAIL_USER and EMAIL_PASS in .env
2. For Gmail, use App Password (not regular password)
3. Enable 2FA on Gmail
4. Check backend console for detailed error

### Issue: "OTP expired"
**Solution:**
- OTP valid for 5 minutes only
- Click "Resend" to get new OTP

### Issue: "Too many attempts"
**Solution:**
- Max 5 incorrect OTP attempts
- Click "Resend" to reset counter

### Issue: "Email already registered"
**Solution:**
- User already exists
- Try logging in instead
- Or use different email

### Issue: "Invalid email or password"
**Solution:**
- Check email spelling
- Check password (case-sensitive)
- Verify user exists in database

---

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Emails delivered successfully
✅ Database records created correctly
✅ Tokens work properly
✅ Session persistence works
✅ Security measures in place

---

**Status**: Ready for Testing
**Last Updated**: Now
**Tester**: You

Start testing and check off each item! 🚀
