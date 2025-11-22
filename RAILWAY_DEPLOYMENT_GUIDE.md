# 🚂 Railway Deployment Guide - HumDono App

## 📋 Complete Step-by-Step Deployment Guide

---

## 🎯 Overview

This guide will help you deploy HumDono app on Railway platform with:
- Backend API on Railway
- Frontend on Railway (or Vercel/Netlify)
- MongoDB Atlas database
- Custom domain: https://humdono.in
- Production Razorpay keys

---

## 📦 Pre-Deployment Checklist

### 1. Get Required Credentials

#### MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Create account / Login
3. Create new cluster (Free tier available)
4. Create database user
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/humdono?retryWrites=true&w=majority
   ```

#### Razorpay Production Keys:
1. Go to https://dashboard.razorpay.com
2. Switch to "Live Mode" (top left)
3. Go to Settings → API Keys
4. Generate Live Keys:
   ```
   Key ID: rzp_live_XXXXXXXXXXXXX
   Key Secret: XXXXXXXXXXXXXXXX
   ```

#### Cloudinary (for images):
1. Go to https://cloudinary.com
2. Create account / Login
3. Get credentials from Dashboard:
   ```
   Cloud Name: your_cloud_name
   API Key: your_api_key
   API Secret: your_api_secret
   ```

---

## 🚀 Railway Deployment Steps

### Step 1: Prepare GitHub Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Railway deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/humdono.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend on Railway

1. **Go to Railway**: https://railway.app
2. **Login with GitHub**
3. **Create New Project**
4. **Deploy from GitHub Repo**:
   - Select your `humdono` repository
   - Railway will auto-detect Node.js

5. **Configure Environment Variables**:
   Click on your service → Variables → Add all these:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/humdono?retryWrites=true&w=majority

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long

# Razorpay LIVE Keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_live_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS (add your frontend URL)
CORS_ORIGINS=https://humdono.in,https://www.humdono.in

# Frontend URL
FRONTEND_URL=https://humdono.in

# Session Secret
SESSION_SECRET=your-session-secret-min-32-characters

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

6. **Set Root Directory**:
   - Settings → Root Directory → `backend`

7. **Deploy**:
   - Railway will automatically deploy
   - Wait for build to complete
   - You'll get a URL like: `https://your-app.railway.app`

### Step 3: Deploy Frontend on Railway

**Option A: Deploy on Railway**

1. **Create New Service** in same project
2. **Link GitHub Repo** (same repo)
3. **Set Root Directory**: `frontend`
4. **Add Environment Variables**:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
VITE_APP_NAME=HumDono
VITE_APP_URL=https://humdono.in
VITE_NODE_ENV=production
```

5. **Deploy**

**Option B: Deploy on Vercel (Recommended for Frontend)**

1. Go to https://vercel.com
2. Import GitHub repository
3. Set Root Directory: `frontend`
4. Add Environment Variables (same as above)
5. Deploy

### Step 4: Configure Custom Domain

#### For Backend (Railway):
1. Go to Railway project → Settings
2. Click "Generate Domain" (get railway.app domain first)
3. Add Custom Domain:
   - Domain: `api.humdono.in`
   - Add CNAME record in your DNS:
     ```
     CNAME api.humdono.in → your-app.railway.app
     ```

#### For Frontend:
1. In Railway/Vercel → Settings → Domains
2. Add Custom Domain: `humdono.in` and `www.humdono.in`
3. Add DNS records:
   ```
   A     humdono.in → [IP from Railway/Vercel]
   CNAME www.humdono.in → humdono.in
   ```

---

## 🔧 Post-Deployment Configuration

### 1. Update Frontend API URL

After backend is deployed, update frontend `.env`:

```env
VITE_API_BASE_URL=https://api.humdono.in/api
# or
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

Redeploy frontend.

### 2. Test Razorpay Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL:
   ```
   https://api.humdono.in/api/payments/webhook
   ```
3. Select events:
   - payment.captured
   - payment.failed
   - subscription.charged
4. Save webhook secret in Railway env:
   ```
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

### 3. Create Admin User

SSH into Railway or use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run command
railway run node scripts/createAdmin.js
```

### 4. Seed Initial Data

```bash
# Create sample coupons
railway run node scripts/createCoupon.js

# Seed gifts
railway run npm run seed:gifts
```

---

## 🧪 Testing Production Deployment

### 1. Test Backend API

```bash
# Health check
curl https://api.humdono.in/api/health

# Test auth
curl -X POST https://api.humdono.in/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### 2. Test Frontend

1. Open https://humdono.in
2. Register new user
3. Complete profile
4. Test all features:
   - ✅ Home feed
   - ✅ Female popups (3 random)
   - ✅ Subscription requirement
   - ✅ Payment with Razorpay LIVE
   - ✅ Messaging
   - ✅ All features

### 3. Test Payment Flow

1. Try to access Wallet → Should show subscription required
2. Go to Subscription page
3. Select ₹700 plan
4. Complete payment with real card (small amount)
5. Verify:
   - ✅ Payment successful
   - ✅ 500 coins added
   - ✅ Wallet unlocked
   - ✅ Boosts unlocked

---

## 📊 Monitoring & Logs

### Railway Logs

```bash
# View logs
railway logs

# Follow logs
railway logs --follow
```

### Monitor Performance

1. Railway Dashboard → Metrics
2. Check:
   - CPU usage
   - Memory usage
   - Request count
   - Error rate

---

## 🔒 Security Checklist

- [x] All `.env` files in `.gitignore`
- [x] Strong JWT secrets (32+ characters)
- [x] Production Razorpay keys
- [x] HTTPS enabled (automatic on Railway)
- [x] CORS configured correctly
- [x] Rate limiting enabled
- [x] Helmet security headers
- [x] MongoDB Atlas with authentication
- [x] No sensitive data in code

---

## 🐛 Troubleshooting

### Issue 1: Backend Not Starting

**Check**:
- Railway logs for errors
- Environment variables set correctly
- MongoDB connection string valid

**Solution**:
```bash
railway logs
# Check for specific error
```

### Issue 2: Frontend Can't Connect to Backend

**Check**:
- `VITE_API_BASE_URL` is correct
- CORS origins include frontend URL
- Backend is running

**Solution**:
Update CORS in backend:
```javascript
CORS_ORIGINS=https://humdono.in,https://www.humdono.in
```

### Issue 3: Payment Failing

**Check**:
- Using LIVE Razorpay keys (not test)
- Webhook configured
- Razorpay account activated

**Solution**:
- Verify keys in Railway env
- Check Razorpay dashboard for errors

### Issue 4: Images Not Uploading

**Check**:
- Cloudinary credentials correct
- API limits not exceeded

**Solution**:
- Verify Cloudinary env vars
- Check Cloudinary dashboard

---

## 📱 Mobile App (Future)

For React Native app:
```env
API_BASE_URL=https://api.humdono.in/api
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
```

---

## 💰 Cost Estimation

### Railway (Backend):
- **Hobby Plan**: $5/month
- **Pro Plan**: $20/month (recommended)
- Includes: 500GB bandwidth, always-on

### MongoDB Atlas:
- **Free Tier**: 512MB storage (good for start)
- **M10**: $57/month (production recommended)

### Cloudinary:
- **Free Tier**: 25GB storage, 25GB bandwidth
- **Plus**: $99/month (if needed)

### Domain:
- **humdono.in**: ~₹500-1000/year

**Total Monthly Cost**: ~$25-100 depending on usage

---

## 🎯 Go-Live Checklist

Before making app public:

- [ ] Backend deployed on Railway
- [ ] Frontend deployed (Railway/Vercel)
- [ ] Custom domain configured
- [ ] MongoDB Atlas connected
- [ ] Razorpay LIVE keys active
- [ ] Cloudinary configured
- [ ] All environment variables set
- [ ] SSL/HTTPS working
- [ ] Test user registration
- [ ] Test payment flow
- [ ] Test all features
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry)
- [ ] Configure backups
- [ ] Load testing done
- [ ] Security audit complete

---

## 📞 Support

### Railway Support:
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

### MongoDB Atlas:
- Support: https://support.mongodb.com

### Razorpay:
- Support: https://razorpay.com/support

---

## 🎉 Success!

Once deployed, your app will be live at:
- **Frontend**: https://humdono.in
- **Backend API**: https://api.humdono.in
- **Status**: Production Ready! 🚀

---

**Last Updated**: Now
**Deployment Platform**: Railway
**Status**: Ready to Deploy
