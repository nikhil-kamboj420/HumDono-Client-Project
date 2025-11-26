# 🚀 Quick Start - Email Authentication

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Email (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-digit password

3. **Update `backend/.env`**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Step 3: Start Backend

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Backend running on port 5000
```

## Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

## Step 5: Test Registration

1. Open http://localhost:5173
2. You'll be redirected to `/login`
3. Click "Sign Up" link
4. Fill in:
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
5. Click "Sign Up"
6. Check your email for OTP (or console for demoOtp)
7. Enter OTP
8. Complete profile

## Step 6: Test Login

1. Go to `/login`
2. Enter email and password
3. Click "Login"
4. You should be logged in!

## Troubleshooting

### "Failed to send email"
- Check EMAIL_USER and EMAIL_PASS in .env
- For Gmail, use App Password (not regular password)
- Make sure 2FA is enabled

### "OTP expired"
- OTP expires in 5 minutes
- Click "Resend" to get new OTP

### "Email already registered"
- User already exists
- Try logging in instead

## Development Mode

In development, OTP is also shown in:
1. API response as `demoOtp`
2. Browser console
3. Backend console

This makes testing easier without email service.

## Production Checklist

Before deploying:
- [ ] Configure real email service (Gmail/SendGrid)
- [ ] Set NODE_ENV=production
- [ ] Remove demoOtp from responses
- [ ] Test email delivery
- [ ] Set up email monitoring

---

**Need Help?** Check `EMAIL_AUTH_IMPLEMENTATION_SUMMARY.md` for details.
