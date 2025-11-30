# Wallet Payment Passkeys Setup

## Required Environment Variables

Add these to your backend `.env` file:

```env
# Payment passkeys
PASSKEY_499=SILVER5612
PASSKEY_699=LOVE4725
PASSKEY_999=STAR8923
PASSKEY_1999=GOLD1567
PASSKEY_4999=KING3490
```

## Passkey Mapping

| Passkey | Amount | Coins Given | Package |
|---------|--------|-------------|---------|
| SILVER5612 | ₹499 | 701 coins | 600 + 101 bonus |
| LOVE4725 | ₹699 | Lifetime Access | Subscription |
| STAR8923 | ₹999 | 1301 coins | 1150 + 151 bonus |
| GOLD1567 | ₹1999 | 2401 coins | 2200 + 201 bonus |
| KING3490 | ₹4999 | 7001 coins | 6000 + 1001 bonus |

## How It Works

1. **User selects a package** on the Wallet page
2. **Chooses payment method:**
   - **UPI Intent**: Opens UPI app directly with amount
   - **Pay with Scanner**: Shows QR code to scan
3. **After payment**, user goes to Profile
4. **Enters the passkey** corresponding to the amount paid
5. **System verifies** the passkey and credits coins instantly

## Payment Flow

### For UPI Intent:
- User clicks "Pay with UPI Intent"
- System opens UPI app with exact amount
- User completes payment in their UPI app
- User enters passkey in Profile to activate coins

### For Scanner Payment:
- User clicks "Pay with Scanner"
- Redirected to scanner page showing QR code
- User scans QR with any UPI app
- Pays the exact amount shown
- Returns to app and enters passkey in Profile

## Coupon Support

- Coupons can be applied before selecting payment method
- Final amount after discount is shown
- Same passkey process applies after payment
- Coins credited are based on the package, not the discounted amount

## Testing

To test the passkey system:
1. Go to Profile page
2. Look for "Enter Pass Key" option
3. Enter one of the passkeys above
4. Verify coins are credited correctly
