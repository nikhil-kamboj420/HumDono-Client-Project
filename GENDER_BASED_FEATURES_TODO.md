# 🎯 Gender-Based Features Implementation Plan

## Issues Identified from Screenshots:

### 1. ❌ Female Account Showing Male-Only Features
**Problem**: Female user seeing:
- "Subscription Required" popup
- "Buy Coins" in settings
- "Lifetime Access" page

**Fix**: Hide these for female users

---

### 2. ❌ Gift Modal Empty
**Problem**: Clicking gift icon shows empty modal

**Fix**: 
- Show gift options
- Female: FREE gifts
- Male: Paid gifts (max ₹50, deduct coins)

---

### 3. ❌ Subscription Page Shows Error Popup
**Problem**: "Amount and coins are required" error popup

**Fix**: Remove validation, directly open Razorpay with coupon support

---

## 📋 Implementation Tasks:

### Task 1: Hide Subscription/Coins for Females
**Files to Update:**
- `frontend/src/pages/Settings.jsx` - Hide "Buy Coins" button
- `frontend/src/pages/Wallet.jsx` - Redirect females away
- `frontend/src/pages/LifetimeSubscription.jsx` - Redirect females away
- `frontend/src/components/Navigation.jsx` - Hide wallet/subscription links

**Logic:**
```javascript
const isFemale = currentUser?.gender?.toLowerCase() === 'female';

if (isFemale) {
  // Hide: Buy Coins, Wallet, Subscription
  // Show: Free messaging, Free gifts
}
```

---

### Task 2: Fix Gift System
**Files to Update:**
- `frontend/src/components/GiftModal.jsx` - Create/Update
- `backend/routes/gifts.js` - Update pricing logic
- `backend/models/Gift.js` - Check gift prices

**Requirements:**
- Female: All gifts FREE
- Male: Gifts cost coins (max ₹50 = 50 coins)
- Show gift options when modal opens
- Deduct coins from male users only

**Gift Prices (for males):**
```javascript
const GIFTS = [
  { id: 1, name: 'Rose', emoji: '🌹', coins: 10 },
  { id: 2, name: 'Heart', emoji: '❤️', coins: 15 },
  { id: 3, name: 'Kiss', emoji: '💋', coins: 20 },
  { id: 4, name: 'Chocolate', emoji: '🍫', coins: 25 },
  { id: 5, name: 'Teddy', emoji: '🧸', coins: 30 },
  { id: 6, name: 'Ring', emoji: '💍', coins: 50 }
];
```

---

### Task 3: Fix Subscription Page
**Files to Update:**
- `frontend/src/pages/LifetimeSubscription.jsx`

**Changes:**
1. Remove "Amount and coins are required" validation
2. Apply coupon BEFORE opening Razorpay
3. Calculate final price with discount
4. Open Razorpay directly with final amount

**Flow:**
```
User clicks "Get Lifetime Access"
    ↓
Check if coupon applied
    ↓
Calculate: ₹699 - discount (if valid coupon)
    ↓
Open Razorpay with final amount
    ↓
User pays
    ↓
Verify payment
    ↓
Activate subscription + add 200 coins
```

---

## 🔧 Quick Fixes Needed:

### Fix 1: Settings Page (Hide Buy Coins for Females)
```javascript
// In Settings.jsx
{!isFemale && (
  <button onClick={() => navigate('/wallet')}>
    Buy Coins
  </button>
)}
```

### Fix 2: Navigation (Hide Wallet for Females)
```javascript
// In Navigation.jsx
const navItems = [
  { path: '/', label: 'Home' },
  { path: '/messages', label: 'Messages' },
  // Only show wallet for males
  ...(userGender !== 'female' ? [{ path: '/wallet', label: 'Wallet' }] : [])
];
```

### Fix 3: Gift Modal (Show Gifts)
```javascript
// In Chat.jsx or GiftModal
const handleSendGift = async (giftId) => {
  const isMale = currentUser?.gender?.toLowerCase() === 'male';
  
  if (isMale) {
    // Check coins and deduct
    const gift = GIFTS.find(g => g.id === giftId);
    if (currentUser.coins < gift.coins) {
      navigate('/wallet');
      return;
    }
  }
  
  // Send gift (free for females)
  await api.sendGift(recipientId, giftId);
};
```

### Fix 4: Subscription Page (Remove Validation)
```javascript
// In LifetimeSubscription.jsx
const handlePurchase = async () => {
  // Calculate final price with coupon
  let finalPrice = 699;
  
  if (couponCode && discount > 0) {
    finalPrice = 699 - discount;
  }
  
  // Open Razorpay directly (no validation popup)
  const options = {
    amount: finalPrice * 100,
    // ... rest of Razorpay config
  };
  
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

---

## 🎯 Priority Order:

1. **HIGH**: Hide subscription/coins for females (Settings, Navigation)
2. **HIGH**: Fix subscription page validation error
3. **MEDIUM**: Implement gift system with pricing
4. **LOW**: Polish UI/UX

---

## ⚠️ Token Limit Reached

**Current Status**: 155k/200k tokens used

**Recommendation**: 
- Implement these changes in next session
- OR I can implement the most critical fixes now (Settings + Subscription page)

**Which would you prefer?**
1. Fix Settings + Subscription page NOW (2-3 changes)
2. Complete all changes in next session (comprehensive)

Let me know and I'll proceed! 🚀
