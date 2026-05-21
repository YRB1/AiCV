# Backend Authentication Setup Guide

## What Was Created

I've set up a basic authentication backend for your ApplyFlow AI app. Here's what's now in place:

### Backend API Endpoints (in your Next.js app)

**1. `/api/auth/signin` - Email/Password Sign In**
- Location: `tool/app/src/app/api/auth/signin/route.ts`
- Accepts: `{ email, password }`
- Returns: User object with success status

**2. `/api/auth/oauth` - OAuth Sign In (Google/GitHub)**
- Location: `tool/app/src/app/api/auth/oauth/route.ts`
- Accepts: `{ provider, code, email, name, picture }`
- Returns: User object with success status

### Frontend Updates

**Sign In Page** (`website/signin.html`)
- Form now sends email/password to `/api/auth/signin`
- Google button sends OAuth token to `/api/auth/oauth`
- GitHub button sends OAuth code to `/api/auth/oauth`
- No more "send to backend" messages

**Sign Up Page** (`website/signup.html`)
- Form now sends name, email, password, and plan selection to `/api/auth/signin`
- OAuth buttons send data to `/api/auth/oauth` with plan selection
- Removed placeholder backend messages

## How It Works (Current)

1. User fills in email/password on signin.html
2. Form submits to `/api/auth/signin`
3. Backend accepts any email/password (testing mode)
4. User object is created and saved to browser's localStorage
5. Success page shows and redirects to index.html

## Next Steps - Production Implementation

Before going live, you'll need to:

### 1. Database Integration
Replace the mock user creation with real database queries:
```typescript
// Instead of creating a mock user, query your database
const user = await db.users.findByEmail(email);
if (!user || !verifyPassword(password, user.passwordHash)) {
  return error('Invalid credentials');
}
```

### 2. Password Hashing
Use bcrypt or similar to hash passwords:
```bash
npm install bcrypt
```

### 3. Session Management
Create proper JWT tokens or session cookies:
```typescript
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
response.cookies.set('auth_token', token, { httpOnly: true });
```

### 4. OAuth Provider Setup
For Google & GitHub, you need to:
- Exchange the OAuth code/token server-side for user info
- Verify the token hasn't been tampered with
- Create or update user in database

### 5. Environment Variables
Create `.env.local` in `tool/app/`:
```
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-database-url
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_SECRET=your-github-secret
```

## Testing Your Backend

### Option 1: Run locally
```bash
cd tool/app
npm run dev
# Backend will run at http://localhost:3000
```

Then update your HTML files to point to localhost:
```javascript
fetch('http://localhost:3000/api/auth/signin', ...)
```

### Option 2: Deploy to production
Once deployed, the frontend will automatically use the production domain.

## Current Limitations

⚠️ **This is a DEMO setup. Do NOT use in production as-is because:**
- Passwords are not hashed or verified
- No real user database
- No token generation/validation
- OAuth tokens not exchanged server-side
- No email verification
- No rate limiting or security

## Files Modified

- ✅ `website/signin.html` - Updated to call backend
- ✅ `website/signup.html` - Updated to call backend
- ✅ `tool/app/src/app/api/auth/signin/route.ts` - New endpoint
- ✅ `tool/app/src/app/api/auth/oauth/route.ts` - New endpoint

## Need Help?

The backend comments include TODOs marking where to add real authentication logic. Start with those!
