# 🧪 Razorpay Testing Guide - Quick Start

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Test Keys (2 minutes)
```bash
1. Visit: https://dashboard.razorpay.com/signup
2. Sign up with email
3. Skip KYC (Test mode works without KYC)
4. Go to Settings → API Keys
5. Click "Generate Test Keys"
6. Copy both keys
```

### Step 2: Add Keys to .env Files

**Backend (.env):**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Frontend (.env):**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

### Step 3: Restart Servers
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

---

## 🧪 Test Payment Flow

### Test Case 1: Successful Payment

1. **Navigate to Wallet:**
   - Login to app
   - Go to Wallet page
   - Click any "Buy Coins" package

2. **Razorpay Checkout Opens:**
   - Select "Card" payment method
   - Enter test card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Name: `Test User`
   - Click "Pay"

3. **Expected Result:**
   - ✅ Success popup appears
   - ✅ Coins added to balance
   - ✅ Transaction appears in history
   - ✅ Backend logs show verification success

### Test Case 2: Failed Payment

1. **Use Failure Card:**
   - Card: `4111 1111 1111 1112`
   - CVV: `123`
   - Expiry: `12/25`

2. **Expected Result:**
   - ❌ Payment fails
   - ❌ Error message shown
   - ❌ No coins credited
   - ❌ Transaction marked as failed

### Test Case 3: UPI Payment

1. **Select UPI:**
   - Choose UPI option
   - Enter: `success@razorpay`
   - Click Pay

2. **Expected Result:**
   - ✅ Payment succeeds
   - ✅ Coins credited

### Test Case 4: Payment Cancellation

1. **Cancel Payment:**
   - Open checkout
   - Click "X" or "Cancel"

2. **Expected Result:**
   - ⚠️ "Payment cancelled" message
   - ❌ No coins credited
   - ❌ Transaction remains "created"

---

## 🔍 Verification Checklist

### After Each Test:

**Check Frontend:**
- [ ] Coin balance updated?
- [ ] Success/error message shown?
- [ ] Transaction appears in history?
- [ ] UI responsive and smooth?

**Check Backend Logs:**
```bash
# Look for these logs:
✅ "Create order error:" (should not appear)
✅ "Payment verified successfully"
✅ "Credited X coins to user Y"
```

**Check Database:**
```javascript
// MongoDB query
db.transactions.find({ user: ObjectId("your_user_id") }).sort({ createdAt: -1 })

// Should show:
{
  status: "paid",
  coins: 220,
  amount: 199,
  razorpayPaymentId: "pay_xxxxx",
  razorpayOrderId: "order_xxxxx"
}
```

**Check User Coins:**
```javascript
db.users.findOne({ _id: ObjectId("your_user_id") })

// Should show updated coins:
{
  coins: 320 // (100 + 220 from purchase)
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Razorpay is not defined"
**Cause:** Razorpay script not loaded
**Fix:**
```javascript
// Check browser console
// Ensure script loads in Wallet.jsx useEffect
// Check network tab for script load
```

### Issue 2: "Invalid signature"
**Cause:** Wrong Key Secret
**Fix:**
```bash
# Verify backend .env
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Restart backend server
npm run dev
```

### Issue 3: "Order not found"
**Cause:** Transaction not created
**Fix:**
```javascript
// Check backend logs for create-order errors
// Verify MongoDB connection
// Check user authentication
```

### Issue 4: Coins not credited
**Cause:** Verification failed
**Fix:**
```bash
# Check backend logs
# Verify signature verification logic
# Check if user exists in database
```

---

## 📊 Test Data Reference

### Test Cards:
| Card Number | Result | Use Case |
|-------------|--------|----------|
| 4111 1111 1111 1111 | ✅ Success | Normal payment |
| 4111 1111 1111 1112 | ❌ Failure | Test error handling |
| 5555 5555 5555 4444 | ✅ Success | Mastercard |
| 3782 822463 10005 | ✅ Success | Amex |

### Test UPI IDs:
| UPI ID | Result |
|--------|--------|
| success@razorpay | ✅ Success |
| failure@razorpay | ❌ Failure |

### Test Amounts:
```
Any amount works in test mode
Recommended: ₹1, ₹10, ₹100, ₹199
```

---

## 🎯 Complete Test Scenario

### Full Flow Test (10 minutes):

```bash
# 1. Check initial balance
GET /api/users/me
Response: { coins: 100 }

# 2. Create order
POST /api/payments/create-order
Body: { amount: 199, coins: 220 }
Response: { order_id: "order_xxxxx" }

# 3. Complete payment (Razorpay UI)
Card: 4111 1111 1111 1111
Result: Success

# 4. Verify payment
POST /api/payments/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
Response: { success: true, totalCoins: 320 }

# 5. Check updated balance
GET /api/users/me
Response: { coins: 320 } ✅

# 6. Check transaction history
GET /api/payments/transactions
Response: { transactions: [{ status: "paid", coins: 220 }] } ✅
```

---

## 🔔 Webhook Testing

### Setup Webhook (Optional for local testing):

1. **Use ngrok for local webhook:**
```bash
# Install ngrok
npm install -g ngrok

# Expose local backend
ngrok http 5000

# Copy ngrok URL
https://abc123.ngrok.io
```

2. **Configure in Razorpay:**
```
Webhook URL: https://abc123.ngrok.io/api/payments/webhook
Events: payment.captured, payment.failed
```

3. **Test webhook:**
```bash
# Make a payment
# Check backend logs for:
"Webhook event received: payment.captured"
"Webhook processed successfully"
```

---

## ✅ Pre-Production Checklist

Before going live:

- [ ] All test cases pass
- [ ] Signature verification works
- [ ] Coins credited correctly
- [ ] Transaction history accurate
- [ ] Error handling works
- [ ] UI/UX smooth
- [ ] Mobile responsive
- [ ] Webhook configured
- [ ] Logs clean (no errors)
- [ ] Database queries optimized

---

## 🎉 Success Criteria

Your integration is ready when:

✅ Test payment completes successfully
✅ Coins appear in user balance
✅ Transaction saved in database
✅ No console errors
✅ Backend logs show success
✅ Webhook processes correctly
✅ Error cases handled gracefully
✅ UI shows proper feedback

---

## 📞 Need Help?

### Quick Debugging:

```bash
# Check backend logs
npm run dev

# Check frontend console
F12 → Console tab

# Check network requests
F12 → Network tab → Filter: /api/payments

# Check database
mongosh
use humdono
db.transactions.find().pretty()
db.users.find({ email: "test@example.com" }).pretty()
```

### Still Stuck?

1. Check RAZORPAY_INTEGRATION.md for detailed docs
2. Verify all environment variables
3. Restart both servers
4. Clear browser cache
5. Check Razorpay dashboard for payment status

---

**Happy Testing! 🚀**
