# 🔐 Environment Variables - Complete Reference

## Railway Backend Environment Variables

Copy these to Railway Dashboard → Your Service → Variables:

```env
# ============================================
# REQUIRED - Core Configuration
# ============================================

NODE_ENV=production
PORT=5000

# ============================================
# REQUIRED - Database
# ============================================

# MongoDB Atlas Connection String
# Get from: https://cloud.mongodb.com → Connect → Connect your application
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/humdono?retryWrites=true&w=majority

# ============================================
# REQUIRED - JWT Authentication
# ============================================

# Generate strong random strings (32+ characters)
# Use: openssl rand -base64 32
JWT_SECRET=REPLACE_WITH_STRONG_RANDOM_STRING_MIN_32_CHARS
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_STRONG_RANDOM_STRING

# ============================================
# REQUIRED - Razorpay (LIVE MODE)
# ============================================

# Get from: https://dashboard.razorpay.com → Settings → API Keys
# IMPORTANT: Use LIVE keys, not TEST keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# REQUIRED - Cloudinary (Image Uploads)
# ============================================

# Get from: https://cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# REQUIRED - CORS & Frontend
# ============================================

# Add all your frontend URLs (comma-separated)
CORS_ORIGINS=https://humdono.in,https://www.humdono.in

# Your frontend URL
FRONTEND_URL=https://humdono.in

# ============================================
# REQUIRED - Security
# ============================================

# Generate: openssl rand -base64 32
SESSION_SECRET=REPLACE_WITH_STRONG_RANDOM_STRING

# ============================================
# OPTIONAL - Rate Limiting
# ============================================

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# OPTIONAL - Razorpay Webhook
# ============================================

# Get from: Razorpay Dashboard → Webhooks → Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# OPTIONAL - SMS/OTP Service
# ============================================

# If using external SMS service (e.g., Twilio, MSG91)
# SMS_API_KEY=your_sms_api_key
# SMS_SENDER_ID=HUMDNO
```

---

## Railway Frontend Environment Variables

Copy these to Railway/Vercel → Your Service → Variables:

```env
# ============================================
# REQUIRED - API Configuration
# ============================================

# Your backend API URL (Railway backend URL)
VITE_API_BASE_URL=https://your-backend.railway.app/api
# OR with custom domain:
# VITE_API_BASE_URL=https://api.humdono.in/api

# ============================================
# REQUIRED - Razorpay
# ============================================

# Same as backend (LIVE key)
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX

# ============================================
# REQUIRED - App Configuration
# ============================================

VITE_APP_NAME=HumDono
VITE_APP_URL=https://humdono.in
VITE_NODE_ENV=production
```

---

## 🔑 How to Generate Secrets

### Method 1: Using OpenSSL (Recommended)
```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Refresh Secret
openssl rand -base64 32

# Generate Session Secret
openssl rand -base64 32
```

### Method 2: Using Node.js
```javascript
// Run in Node.js console
require('crypto').randomBytes(32).toString('base64')
```

### Method 3: Online Generator
- Visit: https://generate-secret.vercel.app/32
- Copy generated string

---

## 📋 Credentials Checklist

Before deployment, ensure you have:

### MongoDB Atlas:
- [ ] Account created
- [ ] Cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0 for Railway)
- [ ] Connection string copied

### Razorpay:
- [ ] Account created and verified
- [ ] KYC completed
- [ ] Switched to LIVE mode
- [ ] Live API keys generated
- [ ] Webhook configured

### Cloudinary:
- [ ] Account created
- [ ] Cloud name noted
- [ ] API credentials copied

### Domain:
- [ ] humdono.in purchased
- [ ] DNS access available
- [ ] Ready to add CNAME/A records

---

## 🔄 Updating Environment Variables

### On Railway:
1. Go to your service
2. Click "Variables" tab
3. Add/Edit variables
4. Click "Deploy" to apply changes

### On Vercel:
1. Go to project settings
2. Click "Environment Variables"
3. Add/Edit variables
4. Redeploy to apply

---

## ⚠️ Security Best Practices

1. **Never commit .env files to Git**
   - Already in .gitignore
   - Double-check before pushing

2. **Use strong secrets**
   - Minimum 32 characters
   - Random, not guessable

3. **Rotate secrets regularly**
   - Change JWT secrets every 3-6 months
   - Update in Railway when changed

4. **Separate test and production**
   - Never use test keys in production
   - Keep credentials separate

5. **Limit access**
   - Only share with team members who need it
   - Use Railway's team features

---

## 🧪 Testing Environment Variables

### Test Backend:
```bash
# Check if variables are loaded
curl https://your-backend.railway.app/api/health

# Should return: {"status": "ok", "environment": "production"}
```

### Test Frontend:
```javascript
// Open browser console on your site
console.log(import.meta.env.VITE_API_BASE_URL)
// Should show your backend URL
```

---

## 📞 Getting Credentials

### MongoDB Atlas:
1. Sign up: https://cloud.mongodb.com
2. Create cluster (Free M0)
3. Database Access → Add user
4. Network Access → Add IP (0.0.0.0/0)
5. Connect → Get connection string

### Razorpay:
1. Sign up: https://razorpay.com
2. Complete KYC
3. Settings → API Keys → Generate Live Keys
4. Copy Key ID and Secret

### Cloudinary:
1. Sign up: https://cloudinary.com
2. Dashboard → Account Details
3. Copy Cloud Name, API Key, API Secret

---

## ✅ Verification Checklist

Before going live:

- [ ] All REQUIRED variables set
- [ ] Using LIVE Razorpay keys (not test)
- [ ] MongoDB connection string correct
- [ ] CORS includes frontend URL
- [ ] Frontend API URL points to backend
- [ ] All secrets are strong (32+ chars)
- [ ] No .env files in Git
- [ ] Tested on Railway
- [ ] Payment flow works
- [ ] All features functional

---

**Ready to deploy! 🚀**
