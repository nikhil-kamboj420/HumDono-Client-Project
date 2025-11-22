# HumDono - Dating App

A comprehensive MERN stack dating application with advanced features including messaging, matching, gifts, friends system, boosts, and referrals.

## Features Implemented

### ✅ Core Features
- **User Authentication** - Phone-based login with OTP verification
- **Profile Management** - Complete profile creation with photos, bio, interests
- **Swipe & Match System** - Like/dislike users with mutual matching
- **Real-time Messaging** - Chat with matches, send text and gift messages
- **Photo Upload** - Multiple photos with Cloudinary integration

### ✅ Social Features
- **Friends System** - Send/receive friend requests, manage friendships
- **Matches** - View all your matches in one place
- **People I Liked** - Track users you've liked
- **People I Disliked** - Track users you've disliked (with undo option)

### ✅ Premium Features
- **Virtual Gifts** - Send gifts during conversations
- **Profile Boosts** - Increase visibility, get super likes
- **Credits/Coins System** - Virtual currency for premium features
- **Referral System** - Invite friends and earn coins

### ✅ Advanced Filtering
- **Age Range** - Filter by minimum and maximum age
- **Relationship Status** - Single, married, divorced, etc.
- **Gender Preferences** - Male, female, other, or any
- **Verification Status** - Show only verified users
- **Photo Requirements** - Show only users with photos

### ✅ Privacy & Settings
- **Visibility Controls** - Control what information is shown
- **Social Links** - Add Instagram, Facebook, LinkedIn, etc.
- **Notification Preferences** - Control what notifications you receive
- **Privacy Settings** - Control who can see your information

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for image storage
- **Socket.io** ready for real-time features
- **bcryptjs** for password hashing
- **Rate limiting** and security middleware

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Axios** for API calls

## Project Structure

```
humdono/
├── backend/
│   ├── models/
│   │   ├── User.js          # User profiles and authentication
│   │   ├── Interaction.js   # Like/dislike interactions
│   │   ├── Match.js         # Mutual matches
│   │   ├── Message.js       # Chat messages
│   │   ├── Gift.js          # Virtual gifts
│   │   ├── Friend.js        # Friend relationships
│   │   ├── Boost.js         # Profile boosts
│   │   ├── Referral.js      # Referral system
│   │   └── Transaction.js   # Coin transactions
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── users.js         # User profile management
│   │   ├── feed.js          # Discovery feed with filters
│   │   ├── interactions.js  # Like/dislike actions
│   │   ├── matches.js       # Match management
│   │   ├── messages.js      # Chat functionality
│   │   ├── gifts.js         # Gift system
│   │   ├── friends.js       # Friend system
│   │   ├── boosts.js        # Profile boosts
│   │   └── referrals.js     # Referral system
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── scripts/
│   │   └── seedGifts.js     # Seed default gifts
│   └── server.js            # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx    # Bottom navigation
│   │   │   ├── SwipeCard.jsx     # Swipeable profile cards
│   │   │   ├── SwipeDeck.jsx     # Card deck container
│   │   │   └── MatchModal.jsx    # Match celebration modal
│   │   ├── pages/
│   │   │   ├── LoginPhone.jsx    # Phone login
│   │   │   ├── VerifyOtp.jsx     # OTP verification
│   │   │   ├── ProfileCreate.jsx # Profile setup
│   │   │   ├── HomeFeed.jsx      # Discovery feed
│   │   │   ├── Matches.jsx       # Matches list
│   │   │   ├── Messages.jsx      # Conversations list
│   │   │   ├── Chat.jsx          # Individual chat
│   │   │   ├── Friends.jsx       # Friends management
│   │   │   ├── Liked.jsx         # People I liked
│   │   │   ├── Disliked.jsx      # People I disliked
│   │   │   ├── Gifts.jsx         # Gift catalog
│   │   │   ├── Boosts.jsx        # Profile boosts
│   │   │   ├── Referrals.jsx     # Referral system
│   │   │   ├── Profile.jsx       # Profile editing
│   │   │   ├── Settings.jsx      # App settings
│   │   │   └── Wallet.jsx        # Coin management
│   │   ├── lib/
│   │   │   └── api.js            # API client
│   │   └── App.jsx               # Main app component
└── package.json                  # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile
- `POST /api/users` - Update user profile
- `POST /api/users/upload-photo` - Upload profile photo
- `PUT /api/users/set-profile-photo` - Set main profile photo
- `DELETE /api/users/photo/:public_id` - Delete photo

### Feed & Discovery
- `GET /api/feed` - Get discovery feed with filters
- `GET /api/feed/filters` - Get available filter options

### Interactions
- `POST /api/interactions` - Like/dislike a user
- `GET /api/interactions/liked` - Get users I liked
- `GET /api/interactions/disliked` - Get users I disliked
- `DELETE /api/interactions/:userId` - Remove interaction

### Matches
- `POST /api/matches/:matchId/open-chat` - Open chat (requires coins)

### Messages
- `GET /api/messages` - Get all conversations
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/messages/:matchId` - Send a message

### Friends
- `GET /api/friends` - Get friends list
- `GET /api/friends/requests` - Get friend requests
- `GET /api/friends/sent` - Get sent requests
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/:requestId/respond` - Accept/decline request
- `DELETE /api/friends/:friendshipId` - Remove friend

### Gifts
- `GET /api/gifts` - Get available gifts
- `POST /api/gifts/send` - Send a gift

### Boosts
- `GET /api/boosts/available` - Get boost options
- `POST /api/boosts/purchase` - Purchase a boost
- `GET /api/boosts/history` - Get boost history

### Referrals
- `GET /api/referrals/my-code` - Get referral code
- `POST /api/referrals/apply-code` - Apply referral code
- `GET /api/referrals/my-referrals` - Get referral history

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd humdono
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   Create `.env` file in backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/humdono
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   CORS_ORIGINS=http://localhost:5173
   ```

4. **Seed Default Data**
   ```bash
   cd backend
   npm run seed:gifts
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm start
   
   # Or separately:
   # Backend: cd backend && npm run dev
   # Frontend: cd frontend && npm run dev
   ```

## Key Features Explained

### 1. Matching System
- Users swipe right (like) or left (dislike) on profiles
- When two users like each other, a match is created
- Matches enable messaging between users

### 2. Coins & Premium Features
- Users earn coins through referrals
- Coins can be spent on:
  - Opening chats with matches
  - Sending virtual gifts
  - Profile boosts for increased visibility
  - Super likes for special attention

### 3. Friend System
- Separate from matching - build a social network
- Send friend requests to anyone
- Friends can see each other's activity
- Different from matches - more social focused

### 4. Advanced Filtering
- Age range slider
- Relationship status dropdown
- Gender preferences
- Verification status filter
- Photo requirements
- Location-based filtering (city)

### 5. Privacy Controls
- Control visibility of age, social links, distance
- Notification preferences
- Profile visibility settings

### 6. Referral System
- Each user gets a unique referral code
- New users can apply referral codes during signup
- Both referrer and referred user get bonus coins
- Track referral statistics and earnings

## Mobile-First Design

The app is designed mobile-first with:
- Bottom navigation for easy thumb access
- Swipeable cards for intuitive interaction
- Touch-friendly buttons and controls
- Responsive design that works on all screen sizes
- Progressive Web App (PWA) ready

## Security Features

- JWT-based authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload with Cloudinary
- CORS protection
- Helmet.js security headers
- Phone number masking for privacy

## Future Enhancements

- Real-time messaging with Socket.io
- Push notifications
- Video calling integration
- Location-based matching
- Advanced matching algorithms
- In-app purchases for coins
- Social media integration
- Photo verification system
- Reporting and moderation tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.