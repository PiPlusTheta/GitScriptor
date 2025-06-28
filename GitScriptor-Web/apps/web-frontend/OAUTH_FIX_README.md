# OAuth Redirect Fix Instructions

## Issue
After signing in with GitHub, users were being redirected to the API endpoint showing raw JSON instead of being properly authenticated in the frontend.

## Solution Applied
1. ✅ Updated `GITHUB_REDIRECT_URI` in `.env` from `http://localhost:8000/auth/callback` to `http://localhost:3000/auth/callback`
2. ✅ Added dedicated `/auth/callback` route in frontend to handle OAuth callback gracefully
3. ✅ Fixed user property mapping in App.tsx

## Required Manual Step
⚠️ **Important**: You need to update your GitHub OAuth App settings to match the new redirect URI:

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Select your GitScriptor OAuth app  
3. Update the "Authorization callback URL" to: `http://localhost:3000/auth/callback`
4. Save the changes

## How it works now
1. User clicks "Sign in with GitHub" 
2. Frontend redirects to GitHub OAuth with `redirect_uri=http://localhost:3000/auth/callback`
3. After user authorizes, GitHub redirects back to `http://localhost:3000/auth/callback` with authorization code
4. Frontend AuthContext detects the code in URL params and calls `/auth/callback` API endpoint
5. API exchanges code for access token and returns user data + JWT
6. Frontend stores the JWT and updates authentication state
7. User is redirected to home page, now authenticated

## Test after restart
1. Restart the API server (to pick up new GITHUB_REDIRECT_URI)
2. Update GitHub OAuth app redirect URL  
3. Try signing in again - should now work smoothly without showing JSON
