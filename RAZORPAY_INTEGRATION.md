# 💳 Razorpay Payment Integration - Complete Guide

## 🎯 Overview

This document explains the complete Razorpay payment integration for buying coins in the HumDono dating app.

---

## 📦 What's Included

### Backend Files:
- ✅ `backend/models/Transaction.js` - Transaction database model
- ✅ `backend/routes/payments.js` - Payment API endpoints
- ✅ `backend/server.js` - Updated with payment routes
- ✅ `backend/.env.example` - Environment variables template

### Frontend Files:
- ✅ `frontend/src/pages/Wallet.jsx` - Enhanced wallet page with Razorpay
- ✅ `frontend/.env.example` - Frontend environment variables

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

Backend dependencies are already installed:
```bash
# Already done
npm install razorpay crypto
```

### Step 2: Configure Environment Variables

#### Backend (.env):
```env
# Add these to your backend/.env file
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=yyy
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

#### Frontend (.env):
```env
# Add this to your frontend/.env file
VITE_RAZORPAY_KEY_ID=xxx
```

### Step 3: Get Razorpay Keys

1. **Sign up at Razorpay:**
   - Visit: https://razorpay.com/
   - Create account (Test mode available immediately)

2. **Get Test Keys:**
   - Login to Dashboard: https://dashboard.razorpay.com
   - Go to Settings → API Keys
   - Generate Test Keys
   - Copy Key ID and Key Secret

3. **Paste Keys:**
   - Backend: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - Frontend: `VITE_RAZORPAY_KEY_ID` (Key ID only)

---

## 🔐 Security Features

### ✅ Implemented Security:
1. **Signature Verification** - All payments verified using HMAC SHA256
2. **Backend Validation** - Coins credited only after backend verification
3. **Idempotency** - Prevents double crediting of coins
4. **Webhook Verification** - Double safety with webhook signature check
5. **Transaction Logging** - All transactions stored in database
6. **No Secret Exposure** - Key Secret never sent to frontend

---

## 🚀 API Endpoints

### 1. Create Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>

Request Body:
{
  "amount": 199,
  "coins": 220
}

Response:
{
  "success": true,
  "order_id": "order_xxxxxxxxxxxxx",
  "amount": 19900,
  "currency": "INR",
  "transactionId": "64f..."
}
```

### 2. Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>

Request Body:
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "coins": 220,
  "totalCoins": 320,
  "transactionId": "64f..."
}
```

### 3. Webhook (Razorpay → Backend)
```http
POST /api/payments/webhook
X-Razorpay-Signature: <signature>

Body: Raw JSON from Razorpay
```

### 4. Get Transactions
```http
GET /api/payments/transactions
Authorization: Bearer <token>

Response:
{
  "success": true,
  "transactions": [...]
}
```

---

## 💰 Coin Packages

| Coins | Bonus | Total | Price |
|-------|-------|-------|-------|
| 50    | 0     | 50    | ₹49   |
| 200   | 20    | 220   | ₹199  |
| 600   | 100   | 700   | ₹499  |
| 1500  | 300   | 1800  | ₹999  |

---

## 🧪 Testing with Razorpay Sandbox

### Test Cards:
```
✅ Success Card:
   Number: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   Name: Any name

❌ Failure Card:
   Number: 4111 1111 1111 1112
   CVV: Any 3 digits
   Expiry: Any future date
```

### Test UPI:
```
✅ Success: success@razorpay
❌ Failure: failure@razorpay
```

### Test Net Banking:
```
Select any bank
Use test credentials provided by Razorpay
```

---

## 🔄 Payment Flow

### User Journey:
```
1. User clicks "Buy Coins" (₹199 for 220 coins)
   ↓
2. Frontend calls /api/payments/create-order
   ↓
3. Backend creates Razorpay order
   ↓
4. Backend saves transaction (status: created)
   ↓
5. Frontend opens Razorpay checkout
   ↓
6. User completes payment
   ↓
7. Razorpay returns payment details
   ↓
8. Frontend calls /api/payments/verify
   ↓
9. Backend verifies signature
   ↓
10. Backend credits coins to user
   ↓
11. Backend updates transaction (status: paid)
   ↓
12. Frontend shows success message
   ↓
13. Webhook confirms payment (double safety)
```

---

## 🎨 Frontend Integration

### Razorpay Checkout Options:
```javascript
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: 19900, // in paise
  currency: 'INR',
  name: 'HumDono',
  description: 'Buy 220 Coins',
  order_id: 'order_xxxxx',
  handler: function (response) {
    // Payment success callback
    // Verify payment on backend
  },
  prefill: {
    name: 'User Name',
    email: 'user@example.com',
    contact: '9999999999'
  },
  theme: {
    color: '#ec4899' // Pink theme
  }
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

---

## 📊 Database Schema

### Transaction Model:
```javascript
{
  user: ObjectId,              // User reference
  orderId: String,             // Internal order ID
  razorpayOrderId: String,     // Razorpay order ID
  razorpayPaymentId: String,   // Razorpay payment ID
  razorpaySignature: String,   // Payment signature
  amount: Number,              // Amount in rupees
  currency: String,            // INR
  coins: Number,               // Coins to credit
  status: String,              // created/paid/failed
  paymentMethod: String,       // card/upi/netbanking
  webhookProcessed: Boolean,   // Webhook flag
  metadata: Object,            // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔔 Webhook Setup

### Configure Webhook in Razorpay Dashboard:

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click "Add New Webhook"
3. Enter URL: `https://your-domain.com/api/payments/webhook`
4. Select Events:
   - ✅ payment.captured
   - ✅ payment.failed
5. Copy Webhook Secret
6. Add to backend .env: `RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx`

---

## ⚠️ Important Notes

### DO:
- ✅ Always verify payment signature on backend
- ✅ Credit coins only after verification
- ✅ Use webhook for double safety
- ✅ Log all transactions
- ✅ Handle payment failures gracefully
- ✅ Show clear error messages to users

### DON'T:
- ❌ Never expose Key Secret on frontend
- ❌ Never credit coins from frontend response
- ❌ Never skip signature verification
- ❌ Never trust frontend data without verification
- ❌ Never double-credit coins (check idempotency)

---

## 🐛 Troubleshooting

### Issue: "Invalid signature"
**Solution:** Check if RAZORPAY_KEY_SECRET is correct in backend .env

### Issue: "Order not found"
**Solution:** Ensure transaction is created before opening checkout

### Issue: "Coins not credited"
**Solution:** Check backend logs for verification errors

### Issue: "Razorpay checkout not opening"
**Solution:** Ensure Razorpay script is loaded (check browser console)

### Issue: "Webhook not working"
**Solution:** 
- Check webhook URL is publicly accessible
- Verify webhook secret is correct
- Check webhook signature verification

---

## 📈 Going Live

### Checklist:
1. ✅ Complete Razorpay KYC
2. ✅ Get Live API Keys
3. ✅ Update environment variables
4. ✅ Test with small amount (₹1)
5. ✅ Configure webhook for production
6. ✅ Add refund policy
7. ✅ Add terms & conditions
8. ✅ Enable required payment methods
9. ✅ Monitor transactions
10. ✅ Setup email notifications

---

## 💡 Testing Checklist

### Before Going Live:
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test payment cancellation
- [ ] Verify coins are credited correctly
- [ ] Check transaction history
- [ ] Test webhook events
- [ ] Verify signature validation
- [ ] Test idempotency (no double credit)
- [ ] Check error handling
- [ ] Test on mobile devices

---

## 📞 Support

### Razorpay Support:
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs
- Email: support@razorpay.com
- Phone: 1800-102-0555

### Integration Help:
- API Docs: https://razorpay.com/docs/api/
- Checkout Docs: https://razorpay.com/docs/payments/
- Webhook Docs: https://razorpay.com/docs/webhooks/

---

## 🎉 Summary

✅ **Complete Razorpay integration implemented**
✅ **Secure payment flow with signature verification**
✅ **Webhook support for double safety**
✅ **Transaction history and logging**
✅ **Beautiful UI with romantic theme**
✅ **Production-ready code**
✅ **Comprehensive error handling**
✅ **Test mode ready (just add keys)**

**Ready to accept payments! Just add your Razorpay keys and start testing!** 🚀
