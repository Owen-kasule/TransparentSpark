# GitHub OAuth App Setup Instructions

## Create a New GitHub OAuth App

1. **Go to GitHub Developer Settings**:
   https://github.com/settings/developers

2. **Click "New OAuth App"**

3. **Fill in the form**:
   - **Application name**: `Owen Portfolio Admin`
   - **Homepage URL**: `https://your-portfolio-domain.com` (or localhost for testing)
   - **Application description**: `Admin authentication for Owen's portfolio`
   - **Authorization callback URL**: `https://qvomiouwgrdrlgtddykr.supabase.co/auth/v1/callback`

4. **Click "Register application"**

5. **Copy the Client ID and Client Secret**:
   - Client ID: (will be generated)
   - Client Secret: Click "Generate a new client secret"

6. **Use these credentials in Supabase Authentication > Providers > GitHub**

## Important Notes

- Keep your Client Secret secure and never share it publicly
- The callback URL must exactly match what's in Supabase
- You can have multiple OAuth apps for different environments (dev, prod)

## Testing

After setup:
1. Go to `/admin` on your portfolio
2. Click "Sign in with GitHub"
3. Authorize the app
4. You should be redirected back as an authenticated admin