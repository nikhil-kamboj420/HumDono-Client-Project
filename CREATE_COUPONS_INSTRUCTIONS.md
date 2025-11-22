# 🎫 How to Create Coupons

## Method 1: Using Browser Console (Easiest)

1. Open your app in browser (http://localhost:5173 or 5174)
2. Login with any account
3. Open browser console (F12 or Ctrl+Shift+I)
4. Run this command:

```javascript
fetch('http://localhost:5000/api/admin/create-sample-coupons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => console.log('✅ Coupons created:', data))
.catch(err => console.error('❌ Error:', err));
```

5. You should see: "Created 4 coupons"
6. Now try using coupon code "INSTA10" in Wallet page!

## Method 2: Using Postman/Thunder Client

1. Make a POST request to: `http://localhost:5000/api/admin/create-sample-coupons`
2. Add header: `Authorization: Bearer YOUR_TOKEN_HERE`
3. Send request
4. Coupons will be created!

## Method 3: Using curl

```bash
curl -X POST http://localhost:5000/api/admin/create-sample-coupons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Created Coupons:

After running the command, these coupons will be available:

1. **WELCOME50** - 50% off for new users (first purchase only)
2. **INSTA10** - 10% off on all purchases (can use 3 times)
3. **BOOST20** - 20% off on boosts (can use 5 times)
4. **PREMIUM100** - ₹100 off on subscription (one time use)

## Verify Coupons:

Check if coupons are created:

```javascript
fetch('http://localhost:5000/api/admin/coupons', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => console.log('📋 All coupons:', data))
```

## Test Coupon:

1. Go to Wallet page
2. Enter "INSTA10" in coupon field
3. Click "Apply"
4. You should see 10% discount!

---

**Note:** Backend server must be running for this to work!
