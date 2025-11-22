# 🎫 Coupon System & Welcome Coins Guide

## 📋 Overview

HumDono app has two promotional features:
1. **Coupon Code System** - Staff members can create and share discount codes
2. **Welcome Coins** - New users automatically receive 600 free coins on registration

---

## 1️⃣ Coupon Code System

### How It Works

Staff members can create coupon codes and share them on Instagram or other platforms. Users can apply these codes to get discounts on:
- Coin purchases (Wallet)
- Boost purchases
- Premium subscriptions

### Creating Coupons

Run the coupon creation script:

```bash
cd backend
node scripts/createCoupon.js
```

This creates sample coupons:
- **WELCOME50** - 50% off for new users on first coin purchase
- **INSTA10** - 10% off on all purchases (Instagram exclusive)
- **BOOST20** - 20% off on all boosts
- **PREMIUM100** - Flat ₹100 off on premium subscription

### Coupon Features

✅ **Discount Types:**
- Percentage discount (e.g., 50% OFF)
- Fixed amount discount (e.g., ₹100 OFF)

✅ **Restrictions:**
- Expiry date
- Maximum usage limit (global)
- Per-user usage limit
- Minimum order amount
- New users only option
- Applicable for specific order types (coins/boosts/subscription/all)

✅ **Usage Tracking:**
- Total usage count
- Per-user usage history
- Order details with each usage

### How Users Apply Coupons

**On Wallet Page:**
1. User enters coupon code (e.g., "INSTA10")
2. Clicks "Apply" button
3. System validates the coupon
4. Discount is shown on all coin packages
5. User completes purchase with discounted price

**On Boosts Page:**
1. Same process as Wallet
2. Discount shown in coins instead of rupees

**On Subscription Page:**
1. Same process as Wallet
2. Discount shown on subscription plans

### Creating Custom Coupons

Edit `backend/scripts/createCoupon.js` and add your coupon:

```javascript
{
  code: 'SUMMER25',
  name: 'Summer Sale',
  description: '25% off on all purchases!',
  discountType: 'percentage',
  discountValue: 25,
  maxDiscount: 300,
  minOrderAmount: 100,
  validFrom: new Date(),
  validUntil: new Date('2024-08-31'),
  maxUsage: 500,
  applicableFor: ['all'],
  userRestrictions: {
    newUsersOnly: false,
    maxUsagePerUser: 2
  }
}
```

Then run: `node scripts/createCoupon.js`

---

## 2️⃣ Welcome Coins (600 Free Coins)

### How It Works

When a new user registers on the app:
1. User enters phone number
2. Verifies OTP
3. **Automatically receives 600 coins** (no payment required)
4. Welcome message is shown: "🎉 Welcome! You've received 600 free coins to get started!"
5. User can immediately start using the app

### Implementation Details

**Backend (auth.js):**
```javascript
if (!user) {
  user = await User.create({ 
    phone,
    coins: 600 // Welcome bonus
  });
  isNewUser = true;
}
```

**Frontend (VerifyOtp.jsx):**
- Shows welcome message for 2 seconds
- Then redirects to profile creation or home page

### Coin Usage

Users can use their 600 welcome coins for:
- Sending messages (10 coins per message)
- Buying boosts (50-100 coins)
- Sending gifts (varies by gift)

---

## 📊 Staff Member Workflow

### Sharing Coupons on Instagram

**Example Post:**
```
🎉 Special Offer for HumDono Users! 🎉

Use code: INSTA10
Get 10% OFF on all purchases! 💰

Valid for 30 days
Limited to first 500 users

Download HumDono now! 💕
[App Link]
```

### Tracking Coupon Performance

Check coupon usage in MongoDB:
```javascript
db.coupons.find({ code: "INSTA10" })
```

View usage history:
```javascript
db.coupons.findOne({ code: "INSTA10" }).usageHistory
```

---

## 🔧 Technical Details

### API Endpoints

**Get Available Coupons:**
```
GET /api/coupons/available?orderType=coins
```

**Validate Coupon:**
```
POST /api/coupons/validate
Body: { code: "INSTA10", orderAmount: 500, orderType: "coins" }
```

**Apply Coupon (Internal):**
```
POST /api/coupons/apply
Body: { code: "INSTA10", orderAmount: 500, orderId: "order_123" }
```

### Database Schema

**Coupon Model:**
- code (unique, uppercase)
- name, description
- discountType, discountValue
- maxDiscount, minOrderAmount
- validFrom, validUntil
- maxUsage, usedCount
- applicableFor (array)
- userRestrictions (object)
- usageHistory (array)

---

## 🎯 Best Practices

### For Staff Members:

1. **Create time-limited coupons** - Creates urgency
2. **Set reasonable usage limits** - Prevents abuse
3. **Track performance** - See which codes work best
4. **Share on multiple platforms** - Instagram, WhatsApp, etc.
5. **Create themed coupons** - Festival offers, weekend deals

### For Developers:

1. **Always validate coupons** - Check expiry, usage limits
2. **Log coupon usage** - For analytics and fraud detection
3. **Handle edge cases** - Expired coupons, invalid codes
4. **Show clear error messages** - Help users understand issues
5. **Update UI in real-time** - Show discounts immediately

---

## 🚀 Quick Start

### 1. Create Sample Coupons
```bash
cd backend
node scripts/createCoupon.js
```

### 2. Test Coupon on Frontend
1. Open Wallet page
2. Enter code: "WELCOME50"
3. Click "Apply"
4. See 50% discount on all packages

### 3. Register New User
1. Enter phone number
2. Verify OTP
3. See welcome message with 600 coins
4. Start using the app!

---

## 📞 Support

For issues or questions:
- Check backend console for error logs
- Verify MongoDB connection
- Ensure coupons are created properly
- Check user coin balance in database

---

## 🎉 Success Metrics

Track these metrics:
- Total coupons created
- Total coupon usage
- Average discount per order
- New user registration rate
- Coin usage patterns
- Revenue impact

---

**Happy Promoting! 🚀💕**
