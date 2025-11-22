# HumDono Dating App - Complete Feature Testing Guide

## 🚀 Pre-Testing Setup

### 1. Start Backend Server
```bash
cd backend
npm start
# Should show: "✅ MongoDB Connected" and "🚀 Backend running on port 5000"
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173"
```

### 3. Database Connection
- Ensure MongoDB is connected
- Check console for "✅ MongoDB Connected" message

---

## 📱 Feature Testing Checklist

### 🔐 Authentication System
- [ ] **Phone Login**: Enter phone number → receive OTP
- [ ] **OTP Verification**: Enter OTP → get access token
- [ ] **Auto-redirect**: Logged in users go to profile creation
- [ ] **Token persistence**: Refresh page maintains login state

### 👤 Profile Management
- [ ] **Profile Creation**: Name, age, bio, interests, photos
- [ ] **Photo Upload**: Upload multiple photos (max 3)
- [ ] **Set Profile Photo**: Mark one photo as profile picture
- [ ] **Delete Photos**: Remove uploaded photos
- [ ] **Profile Update**: Edit existing profile information
- [ ] **Custom Font**: Verify ARLRDBD font is applied globally

### 🏠 Home Feed & Discovery
- [ ] **Profile Cards**: Scrollable profile cards with all details
- [ ] **Scroll Functionality**: Image scrolls away, buttons stay fixed
- [ ] **Like/Dislike**: Swipe actions work properly
- [ ] **Filters**: Age, gender, relationship status filters
- [ ] **Load More**: Infinite scroll or load more button
- [ ] **Match Detection**: Like creates match if mutual

### 👥 Friend System
- [ ] **Send Friend Request**: Click "Add as Friend" button
- [ ] **Receive Notifications**: Badge shows pending requests count
- [ ] **Accept/Decline**: Respond to friend requests
- [ ] **Friends List**: View all accepted friends
- [ ] **Sent Requests**: View pending sent requests
- [ ] **Remove Friends**: Delete existing friendships

### 💬 Messaging System
- [ ] **First Message Free**: Send first message without coins
- [ ] **Coins Deduction**: 10 coins deducted for subsequent messages
- [ ] **Insufficient Coins**: Redirect to wallet when no coins
- [ ] **Subscription Bypass**: Unlimited messages with active subscription
- [ ] **Message Display**: Both users can see messages
- [ ] **Reply Restriction**: Non-subscribers can't reply without coins

### 💰 Wallet & Subscription
- [ ] **Coin Balance**: Display current coin balance
- [ ] **Coin Packages**: Show different coin purchase options
- [ ] **Subscription Plans**: Display Basic, Premium, Gold plans
- [ ] **Active Subscription**: Show current subscription status
- [ ] **Payment Integration**: Test payment flow (if implemented)

### 🔔 Notifications
- [ ] **Friend Request Badge**: Red badge on Friends tab
- [ ] **Real-time Updates**: Badge updates when requests change
- [ ] **Navigation Badges**: Proper badge display in side menu

### 📞 Phone Access Requests
- [ ] **Request Access**: Click "Request Access" button
- [ ] **Success Message**: Confirmation when request sent
- [ ] **Error Handling**: Proper error messages for failures

### 🎁 Additional Features
- [ ] **Gifts System**: Send/receive gifts (if implemented)
- [ ] **Boosts**: Profile boost functionality
- [ ] **Referrals**: Invite friends system
- [ ] **Settings**: User preferences and account settings

---

## 🧪 Detailed Test Scenarios

### Scenario 1: New User Journey
1. Open app → Login page
2. Enter phone number → OTP sent
3. Enter OTP → Profile creation page
4. Fill profile details → Upload photos
5. Save profile → Home feed loads
6. Swipe through profiles → Like someone
7. Check matches → Send message

### Scenario 2: Messaging with Coins
1. Find a match
2. Send first message (free)
3. Send second message (10 coins deducted)
4. Continue until coins run out
5. Try to send message → Wallet redirect
6. Buy coins or subscription
7. Resume messaging

### Scenario 3: Friend System
1. Browse profiles
2. Send friend request
3. Check notification badge
4. Switch to another account
5. Accept friend request
6. Verify friendship in both accounts

### Scenario 4: Profile Scrolling
1. Open any profile card
2. Scroll down through all sections:
   - Profile image (should scroll away)
   - Bio and basic info
   - Photo gallery
   - Verification badges
   - Interests and lifestyle
   - Premium status
   - Action buttons
3. Verify fixed elements stay in place

---

## 🐛 Common Issues to Check

### Frontend Issues
- [ ] Console errors in browser developer tools
- [ ] Network errors in Network tab
- [ ] Responsive design on mobile/desktop
- [ ] Font loading and display
- [ ] Image loading and display

### Backend Issues
- [ ] Server console for error messages
- [ ] Database connection status
- [ ] API endpoint responses (200, 404, 500 status codes)
- [ ] Authentication middleware working
- [ ] CORS configuration

### Database Issues
- [ ] User creation and updates
- [ ] Photo storage and retrieval
- [ ] Friend relationships
- [ ] Message storage
- [ ] Coin transactions

---

## 📊 Performance Testing

### Load Testing
- [ ] Multiple users simultaneously
- [ ] Large photo uploads
- [ ] Many messages in conversation
- [ ] Extensive friend lists

### Mobile Testing
- [ ] Touch interactions
- [ ] Scroll performance
- [ ] Image optimization
- [ ] Network connectivity issues

---

## 🔧 Debugging Tools

### Browser Developer Tools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls and responses
- **Application**: Check localStorage and cookies
- **Elements**: Inspect CSS and font loading

### Backend Debugging
- **Server Logs**: Monitor console output
- **Database**: Check MongoDB collections
- **API Testing**: Use Postman or similar tools

---

## ✅ Success Criteria

### Must Work
- ✅ User authentication and profile creation
- ✅ Profile card scrolling functionality
- ✅ Friend request system with notifications
- ✅ Messaging with coins/subscription logic
- ✅ Wallet and subscription management

### Should Work
- ✅ Responsive design across devices
- ✅ Custom font application
- ✅ Error handling and user feedback
- ✅ Performance optimization

### Nice to Have
- ✅ Real-time notifications
- ✅ Advanced filtering
- ✅ Gift system integration
- ✅ Social media integration

---

## 🚨 Critical Test Points

1. **Authentication Flow**: Must work for app access
2. **Profile Scrolling**: Core UX feature
3. **Friend Requests**: Social functionality
4. **Messaging Costs**: Revenue model
5. **Error Handling**: User experience

---

## 📝 Test Results Template

```
Feature: [Feature Name]
Status: ✅ Pass / ❌ Fail / ⚠️ Partial
Issues: [List any problems found]
Notes: [Additional observations]
```

Use this guide to systematically test all features and ensure the app works as expected!