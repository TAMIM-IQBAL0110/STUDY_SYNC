# Email Configuration Setup Guide

## Current Status
✅ Verification endpoints are working  
✅ Verification codes are being generated and stored  
✅ Debug endpoints can retrieve codes  
❌ Emails are NOT being sent (SMTP authentication failing)  

## Steps to Fix Email Delivery

### Step 1: Generate Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character app password
4. **Copy this password** (it looks like: `abcd efgh ijkl mnop`)

### Step 2: Update Render Environment Variables
1. Go to https://dashboard.render.com
2. Select your StudySync backend service
3. Click "Environment" tab
4. Update or create these variables:
   - **EMAIL_USER**: your-gmail@gmail.com (the Gmail account sending emails)
   - **EMAIL_PASS**: xxxx xxxx xxxx xxxx (the 16-char app password from Step 1 - without spaces)

### Step 3: Verify Configuration
After updating, Render will auto-redeploy. Check logs to see if emails send:
1. Go to Render dashboard → Logs tab
2. Look for "📧 EMAIL_USER" and "📧 EMAIL_PASS loaded?" messages
3. Try registering a new account at https://studysynch.netlify.app/signup
4. Check the logs for "✅ Email sent" or "❌ Error sending email"

### Step 4: Test Email Endpoint (Optional)
Once deployed, test the email endpoint:
```
GET https://study-sync-mv99.onrender.com/api/v1/auth/test-email/your-email@gmail.com
```
Response will show success or detailed error message.

## Debug Endpoints Available

### Get Verification Code
```
GET /api/v1/auth/debug-code/:email
```
Example: `https://study-sync-mv99.onrender.com/api/v1/auth/debug-code/user@example.com`

### Test Email Sending
```
GET /api/v1/auth/test-email/:email
```
Example: `https://study-sync-mv99.onrender.com/api/v1/auth/test-email/user@example.com`

## Common Issues

### "Invalid credentials" error
- The app password might be incorrect
- Check it has no spaces when pasted into Render
- Generate a new one and try again

### "Too many requests" error
- Gmail rate limiting - wait a few minutes
- Reduce test frequency

### Environment variables not loading
- Make sure they're set in Render (not in .env file)
- Render auto-redeploys when env vars change
- Check "Recent deploys" tab to confirm deployment

## After Fixing Emails

Remove debug endpoints for production:
- `/api/v1/auth/debug-code/:email`
- `/api/v1/auth/test-email/:email`

These are in `Backend/routes/authRoute.js` lines 48-74
