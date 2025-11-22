# 🚨 Critical Feature Tests - HumDono Dating App

## ⚡ Quick Test Checklist

### 🔥 Must Test First (Critical Path)

#### 1. Authentication Flow
```
✅ Test Steps:
1. Open http://localhost:5173
2. Enter phone number (use any 10-digit number)
3. Enter OTP: 123456 (demo OTP)
4. Should redirect to profile creation
5. Fill profile and save
6. Should redirect to home feed

❌ Common Issues:
- Backend not running (port 5000)
- MongoDB not connected
- CORS errors in console
```

#### 2. Profile Card Scrolling
```
✅ Test Steps:
1. Go to home feed
2. View any profile card
3. Scroll down through entire profile
4. Verify image scrolls away
5. Verify message button stays fixed at top
6. Verify like/skip buttons stay fixed at bottom

❌ Common Issues:
- Scroll not working on mobile
- Fixed elements not staying in place
- Content overflow issues
```

#### 3. Friend Request System
```
✅ Test Steps:
1. Click "Add as Friend" on any profile
2. Check for success message
3. Go to Friends tab
4. Verify notification badge appears
5. Check friend requests section
6. Accept/decline requests

❌ Common Issues:
- 404 error on friend request API
- Badge not updating
- Requests not showing
```

#### 4. Messaging with Coins
```
✅ Test Steps:
1. Get a match (like someone)
2. Go to Messages tab
3. Send first message (should be free)
4. Send second message (should cost 10 coins)
5. Continue until coins run out
6. Verify redirect to wallet

❌ Common Issues:
- Coins not deducting
- No redirect when insufficient coins
- Messages not saving
```

---

## 🔍 Detailed Testing Scenarios

### Scenario A: New User Complete Journey
```
1. Login → Profile Creation → Home Feed
2. Browse profiles → Like someone → Get match
3. Send message → Check coins → Buy more coins
4. Send friend request → Accept request
5. Update profile → Upload photos
```

### Scenario B: Existing User Daily Usage
```
1. Login → Check notifications
2. View friend requests → Accept/decline
3. Check messages → Reply to conversations
4. Browse new profiles → Like/dislike
5. Check wallet → Buy coins if needed
```

### Scenario C: Edge Cases
```
1. No internet connection
2. Server downtime
3. Invalid phone numbers
4. Large photo uploads
5. Rapid clicking/spamming
```

---

## 🐛 Known Issues to Check

### Frontend Issues
- [ ] Custom font (ARLRDBD) loading properly
- [ ] Responsive design on mobile devices
- [ ] Image upload and deletion working
- [ ] Navigation badges updating correctly
- [ ] Error messages displaying properly

### Backend Issues
- [ ] All API endpoints responding (200 status)
- [ ] Authentication middleware working
- [ ] Database operations completing
- [ ] File uploads to Cloudinary working
- [ ] CORS configuration correct

### Integration Issues
- [ ] Frontend-backend communication
- [ ] Database-backend synchronization
- [ ] Real-time updates working
- [ ] Error handling end-to-end

---

## 🧪 Browser Console Checks

### Expected Console Messages
```
✅ Good:
- No red error messages
- Font loaded successfully
- API calls returning 200 status
- WebSocket connections (if any)

❌ Bad:
- 404 API errors
- Font loading failures
- CORS policy errors
- Uncaught exceptions
```

### Network Tab Checks
```
✅ Monitor:
- API response times (<2 seconds)
- Image loading speeds
- Failed requests (red entries)
- Status codes (200, 201 = good)
```

---

## 📱 Mobile Testing

### Touch Interactions
- [ ] Swipe gestures work
- [ ] Tap targets are large enough
- [ ] Scroll performance is smooth
- [ ] Keyboard doesn't break layout

### Screen Sizes
- [ ] iPhone SE (375px width)
- [ ] iPhone 12 (390px width)
- [ ] iPad (768px width)
- [ ] Desktop (1024px+ width)

---

## 🚀 Performance Testing

### Load Testing
```
Test with:
- 10+ photos in profile
- 100+ messages in chat
- 50+ friend requests
- Multiple browser tabs
```

### Memory Testing
```
Check for:
- Memory leaks (increasing RAM usage)
- Image caching issues
- Infinite scroll performance
- Large data set handling
```

---

## 🔧 Quick Fixes for Common Issues

### 1. Backend Not Starting
```bash
cd backend
npm install
npm start
```

### 2. Frontend Not Loading
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Connection Issues
```
Check backend/.env file:
- MONGO_URI is correct
- Database credentials are valid
- Network connectivity to MongoDB
```

### 4. API 404 Errors
```
Verify in backend/server.js:
- All routes are imported
- Routes are mounted with app.use()
- Route files exist in routes/ folder
```

### 5. Font Not Loading
```
Check:
- Font file exists in frontend/public/Fonts/
- CSS @font-face declaration is correct
- Font path is correct (/Fonts/ARLRDBD.TTF)
```

---

## 📊 Success Metrics

### Core Functionality (Must Work)
- [ ] 100% authentication success rate
- [ ] 100% profile creation success rate
- [ ] 100% message sending success rate
- [ ] 100% friend request success rate

### User Experience (Should Work)
- [ ] <2 second page load times
- [ ] <1 second API response times
- [ ] 0 console errors
- [ ] Smooth scrolling on all devices

### Business Logic (Critical)
- [ ] Coins deducted correctly
- [ ] Subscriptions bypass coin requirements
- [ ] Friend requests create notifications
- [ ] Matches enable messaging

---

## 🎯 Testing Priority Order

1. **Authentication** (Blocks everything else)
2. **Profile Creation** (Required for app usage)
3. **Home Feed & Scrolling** (Core UX feature)
4. **Messaging with Coins** (Revenue model)
5. **Friend Requests** (Social features)
6. **Wallet & Subscriptions** (Monetization)
7. **Additional Features** (Nice to have)

---

## 📝 Bug Report Template

```
Bug Title: [Brief description]
Priority: High/Medium/Low
Steps to Reproduce:
1. 
2. 
3. 

Expected Result: 
Actual Result: 
Browser: 
Device: 
Console Errors: 
Screenshots: 
```

Use this guide to systematically test all critical features!