# Vercel Deployment Guide for Donation Portal Frontend

This guide will help you deploy the Donation Portal frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional): `npm install -g vercel`
3. Backend API deployed and accessible
4. Cloudflare R2 bucket configured

## Environment Variables

Before deploying, you need to set up the following environment variables in your Vercel project:

### Required Environment Variables

1. **VITE_API_BASE_URL**
   - Description: The base URL of your backend API
   - Example: `https://api.yourdonationportal.com`
   - Vercel Secret Name: `@donation_portal_api_url`

2. **VITE_R2_PUBLIC_URL**
   - Description: The public URL of your Cloudflare R2 bucket
   - Example: `https://pub-xxxxx.r2.dev`
   - Vercel Secret Name: `@r2_public_url`

3. **VITE_R2_ACCOUNT_ID**
   - Description: Your Cloudflare account ID
   - Example: `abc123def456`
   - Vercel Secret Name: `@r2_account_id`

4. **VITE_R2_ACCESS_KEY_ID**
   - Description: Your R2 access key ID
   - Example: `xxxxxxxxxxxxx`
   - Vercel Secret Name: `@r2_access_key_id`

5. **VITE_R2_SECRET_ACCESS_KEY**
   - Description: Your R2 secret access key
   - Example: `xxxxxxxxxxxxxxxxxxxxxxxx`
   - Vercel Secret Name: `@r2_secret_access_key`

6. **VITE_R2_BUCKET_NAME**
   - Description: Your R2 bucket name
   - Example: `donation-portal-media`
   - Vercel Secret Name: `@r2_bucket_name`

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select the `donation-portal/frontend` directory as the root

2. **Configure Project Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add each environment variable listed above
   - For sensitive values, use Vercel Secrets:
     ```bash
     vercel secrets add donation_portal_api_url "https://api.yourdonationportal.com"
     vercel secrets add r2_public_url "https://pub-xxxxx.r2.dev"
     vercel secrets add r2_account_id "your-account-id"
     vercel secrets add r2_access_key_id "your-access-key"
     vercel secrets add r2_secret_access_key "your-secret-key"
     vercel secrets add r2_bucket_name "your-bucket-name"
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd donation-portal/frontend
   ```

4. **Create Vercel Secrets** (first time only)
   ```bash
   vercel secrets add donation_portal_api_url "https://api.yourdonationportal.com"
   vercel secrets add r2_public_url "https://pub-xxxxx.r2.dev"
   vercel secrets add r2_account_id "your-account-id"
   vercel secrets add r2_access_key_id "your-access-key"
   vercel secrets add r2_secret_access_key "your-secret-key"
   vercel secrets add r2_bucket_name "your-bucket-name"
   ```

5. **Deploy**
   ```bash
   # For preview deployment
   vercel

   # For production deployment
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued

### 2. CORS Configuration

Ensure your backend API allows requests from your Vercel domain:

```javascript
// Backend CORS configuration
const allowedOrigins = [
  'https://your-project.vercel.app',
  'https://www.yourdonationportal.com', // if using custom domain
];
```

### 3. Cloudflare R2 CORS

Configure CORS for your R2 bucket to allow uploads from your Vercel domain:

```json
[
  {
    "AllowedOrigins": [
      "https://your-project.vercel.app",
      "https://www.yourdonationportal.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Vercel Configuration Details

The `vercel.json` file includes:

### Rewrites
- All routes are rewritten to `/index.html` for SPA routing

### Headers
- **Cache-Control**: Assets are cached for 1 year
- **Security Headers**:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: Restricts camera, microphone, and geolocation

### Environment Variables
- Automatically linked to Vercel Secrets for secure storage

## Troubleshooting

### Build Fails

1. **Check Node Version**
   - Ensure you're using Node.js 18 or higher
   - Set in Vercel: Project Settings → General → Node.js Version

2. **Check Dependencies**
   - Ensure all dependencies are in `package.json`
   - Run `npm install` locally to verify

3. **Check Environment Variables**
   - Verify all required environment variables are set
   - Check for typos in variable names

### API Connection Issues

1. **CORS Errors**
   - Verify backend CORS configuration includes Vercel domain
   - Check browser console for specific CORS errors

2. **API URL**
   - Ensure `VITE_API_BASE_URL` is correct
   - Test API endpoint manually: `curl https://api.yourdonationportal.com/health`

### Upload Issues

1. **R2 Configuration**
   - Verify all R2 environment variables are correct
   - Check R2 bucket CORS configuration
   - Ensure R2 access keys have proper permissions

2. **File Size Limits**
   - Vercel has a 4.5MB limit for serverless function payloads
   - Large file uploads should go directly to R2 from the client

## Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics for insights:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. View metrics in the Analytics tab

### Error Tracking

Consider integrating error tracking:
- Sentry
- LogRocket
- Rollbar

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

### Branch Protection

Configure branch protection rules:
1. Require pull request reviews
2. Require status checks to pass
3. Enable automatic deployments for approved PRs

## Performance Optimization

### Build Optimization

The project is already configured with:
- Code splitting
- Tree shaking
- Asset optimization
- Lazy loading

### CDN

Vercel automatically serves your app via their global CDN:
- Automatic HTTPS
- HTTP/2
- Brotli compression
- Edge caching

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use Vercel Secrets** for sensitive environment variables
3. **Enable branch protection** on your repository
4. **Review deployment logs** regularly
5. **Keep dependencies updated** with `npm audit`

## Support

For issues or questions:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: Create an issue in your repository

## Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Cloudflare R2 bucket is configured
- [ ] All environment variables are set in Vercel
- [ ] CORS is configured on backend and R2
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Test all features after deployment
- [ ] Monitor error logs for issues
- [ ] Set up analytics and monitoring

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure custom domain (if needed)
4. Enable Vercel Analytics
5. Document any custom configurations
6. Share deployment URL with team

---

**Last Updated**: November 5, 2025
