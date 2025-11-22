# Gender-Based Pricing Implementation

## Overview
Implemented gender-based pricing model where:
- **Females**: Free unlimited messaging (no coins required)
- **Males**: Pay-per-message system (10 coins per message after first message)

## Changes Made

### 1. Frontend Changes

#### Wallet Page (`frontend/src/pages/Wallet.jsx`)
- Added gender check for female users
- Females see a special "Free for You" page instead of coin purchase options
- Explains that they get unlimited messaging for free
- Provides quick navigation to messages

#### Navigation (`frontend/src/components/Navigation.jsx`)
- Wallet icon/link hidden for female users
- Added `userGender` state to track user's gender
- Conditionally filters wallet from navigation menu

### 2. Backend Changes

#### Messages Route (`backend/routes/messages.js`)
- Added gender-based coin deduction logic
- Females bypass coin requirement completely
- Males still pay 10 coins per message (after first message)
- Response includes `isFreeForFemale` flag

### 3. Logic Flow

#### For Female Users:
1. Navigate to Wallet → See "Free for You" page
2. Send messages → No coins deducted
3. Wallet icon hidden in navigation

#### For Male Users:
1. Navigate to Wallet → Can purchase coins
2. Send messages → 10 coins deducted per message (after first)
3. Wallet icon visible in navigation

## Testing

### Test Female Account:
1. Create/login with female account
2. Check navigation - no wallet icon
3. Try to access `/wallet` - see free messaging page
4. Send messages - no coins deducted

### Test Male Account:
1. Create/login with male account
2. Check navigation - wallet icon visible
3. Purchase coins from wallet
4. Send messages - coins deducted (10 per message)

## Database Schema

No schema changes required. Uses existing:
- `User.gender` field (string: 'male', 'female', etc.)
- `User.coins` field (number)

## API Responses

### Message Send Response:
```json
{
  "ok": true,
  "message": { ... },
  "coinsDeducted": 0,  // 0 for females, 10 for males
  "remainingCoins": 100,
  "isFreeForFemale": true  // true for females
}
```

## Special Feature: Females Can Message Anyone

### Direct Messaging (Females Only):
- Females can send messages to ANY male user without matching first
- Automatically creates a match when female sends first message
- Male receives the message and can reply
- No coins required for females

### How It Works:
1. Female sees a profile on HomeFeed
2. Clicks "Message" button on profile card
3. Sends message directly
4. Match is auto-created
5. Conversation starts immediately

### Backend Route:
```
POST /api/messages/direct/:receiverId
- Females only
- Auto-creates match
- No coin deduction
```

## Notes

- First message in any conversation is always free (for both genders)
- Subscription holders (if implemented) also get free messaging
- Gender is case-insensitive ('Female', 'female', 'FEMALE' all work)
- Females can still see their coin balance (if any) but cannot purchase more
- **Females can message anyone directly without match requirement**
- Males must match first before messaging

## Future Enhancements

- Add analytics to track gender-based usage
- Consider premium features for females (profile boosts, etc.)
- Add admin dashboard to monitor revenue by gender
