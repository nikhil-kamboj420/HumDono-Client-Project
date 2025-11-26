# 📧 Email OTP Authentication Migration Plan

## Overview
Migrate from Phone OTP to Email + Password + Email OTP authentication.

## Changes Required

### 1. Backend Changes
- Update User model (add email, password fields)
- Update OTP model (change phone to email)
- Update auth routes (register, login, send-otp, verify-otp)
- Add email service (nodemailer)
- Add password hashing (bcrypt - already installed)

### 2. Frontend Changes
- Rename LoginPhone.jsx → Register.jsx
- Create new Login.jsx page
- Update VerifyOtp.jsx for email
- Update API client
- Update routing

### 3. Environment Variables
- Add email service credentials (Gmail/SendGrid)

## Implementation Steps
See individual files for detailed implementation.
