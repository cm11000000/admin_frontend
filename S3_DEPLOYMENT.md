# S3 Deployment Guide for SabPaisa Admin V5

## 🚀 Quick Deploy

```bash
npm run deploy:s3
```

## 📋 Deployment Details

- **S3 Bucket**: `sabpaisa-admin-v5-20251010`
- **Region**: `ap-south-1` (Mumbai)
- **AWS Profile**: `chaitanya-rnd`
- **Website URL**: http://sabpaisa-admin-v5-20251010.s3-website.ap-south-1.amazonaws.com

## 🛠️ Available Commands

1. **Full Deployment** (recommended):
   ```bash
   npm run deploy:s3
   ```
   - Builds the project
   - Syncs to S3 with optimized cache headers
   - Sets proper cache control for assets

2. **Simple Deployment**:
   ```bash
   npm run deploy:s3:simple
   ```
   - Basic build and sync without cache optimization

3. **Manual Deployment**:
   ```bash
   # Build the project
   npm run build

   # Upload to S3
   aws s3 sync out/ s3://sabpaisa-admin-v5-20251010/ \
       --delete \
       --profile chaitanya-rnd \
       --region ap-south-1
   ```

## ⚙️ Configuration

### Next.js Configuration (`next.config.js`)
- `output: 'export'` - Enables static export
- `trailingSlash: true` - Adds trailing slashes for S3 compatibility
- `images.unoptimized: true` - Disables Next.js image optimization for static export

### S3 Bucket Configuration
- Static website hosting enabled
- Public read access configured
- Index document: `index.html`
- Error document: `404.html`

## 📦 Build Output

The static build creates an `out/` directory with:
- HTML files for each route
- `_next/static/` - JavaScript, CSS, and other static assets
- Images and public assets

## 🔒 Important Notes

1. **Authentication**: Since this is a static site, authentication is handled client-side through API calls to your backend servers.

2. **Environment Variables**: Make sure your API endpoints are correctly configured in your environment variables.

3. **CORS**: Ensure your backend APIs allow requests from the S3 website domain.

4. **Cache Headers**:
   - HTML files: `max-age=0, must-revalidate` (always fresh)
   - Static assets: `max-age=31536000, immutable` (cached for 1 year)

## 🚨 Troubleshooting

### Build Errors
- Check TypeScript errors: `npm run type-check`
- Check ESLint: `npm run lint`

### 404 Errors
- Ensure `trailingSlash: true` is set in `next.config.js`
- Check that all routes are properly exported

### API Connection Issues
- Verify CORS settings on your backend
- Check browser console for network errors
- Ensure API URLs are using HTTPS

## 🎯 Next Steps

### Optional: CloudFront Distribution

For better performance and HTTPS support, consider setting up CloudFront:

1. Create a CloudFront distribution
2. Set S3 bucket as origin
3. Configure custom domain (optional)
4. Update deployment script with distribution ID

### Optional: Custom Domain

To use a custom domain:
1. Create Route 53 hosted zone
2. Point domain to CloudFront or S3
3. Configure SSL certificate (CloudFront required for HTTPS)

## 📝 Maintenance

- Monitor S3 costs (storage + bandwidth)
- Set up lifecycle policies for old versions
- Configure S3 access logs for analytics
- Consider enabling versioning for rollback capability

## 🔗 Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [CloudFront with S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html)