# Staging Deployment Documentation - Frontend

## Overview
The frontend (Next.js 15) is deployed to AWS S3 + CloudFront CDN for staging environment.

## Infrastructure

### AWS Account
- **Profile**: `chaitanya-staging-2`
- **Account ID**: `605134461870`
- **Region**: `ap-south-1` (Mumbai)

### AWS Services
- **S3 Bucket**: `sabpaisa-admin-staging`
  - Static website hosting enabled
  - Public read access for website content
  - All other public access blocked
- **CloudFront Distribution**: `EXDXAHC1SOAO8`
  - Custom error pages (404, 403)
  - Default root object: `index.html`
  - Origin: S3 website endpoint

### Access URLs
- **CloudFront URL**: https://d2pkux0qnhtskm.cloudfront.net
- **S3 Website URL**: http://sabpaisa-admin-staging.s3-website-ap-south-1.amazonaws.com

## Deployment Process

### Automatic Deployment (GitHub Actions)

**Trigger**: Push to `staging` branch

**Workflow File**: `.github/workflows/deploy-staging.yml`

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies with `npm ci --legacy-peer-deps`
4. Build static export with `npm run build:static`
5. Configure AWS credentials (hardcoded in workflow)
6. Sync build output to S3 bucket
7. Invalidate CloudFront cache

**Build Configuration**:
- Next.js static export mode
- Output directory: `out/`
- All pages force-static

### Manual Deployment

```bash
# 1. Build the application locally
npm ci --legacy-peer-deps
npm run build:static

# 2. Configure AWS CLI
aws configure --profile chaitanya-staging-2

# 3. Sync to S3
aws s3 sync out/ s3://sabpaisa-admin-staging/ \
  --delete \
  --profile chaitanya-staging-2 \
  --region ap-south-1

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EXDXAHC1SOAO8 \
  --paths "/*" \
  --profile chaitanya-staging-2
```

## GitHub Actions Configuration

### Secrets/Variables (Hardcoded in workflow)
- `AWS_ACCESS_KEY_ID`: AKIAYZZGTDOXIRTE65UJ
- `AWS_SECRET_ACCESS_KEY`: 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
- `AWS_REGION`: ap-south-1
- `S3_BUCKET`: sabpaisa-admin-staging
- `CLOUDFRONT_DISTRIBUTION_ID`: EXDXAHC1SOAO8

**Note**: Credentials are hardcoded in workflow file as repository is private. For production, use GitHub Secrets.

## Package Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "build:static": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Monitoring

### GitHub Actions
- **Workflow URL**: https://github.com/cm11000000/admin_frontend/actions
- **Latest Run Status**: Check for deployment failures

### CloudFront Metrics
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution \
  --id EXDXAHC1SOAO8 \
  --profile chaitanya-staging-2

# Check recent cache invalidations
aws cloudfront list-invalidations \
  --distribution-id EXDXAHC1SOAO8 \
  --profile chaitanya-staging-2 \
  --max-items 3
```

### S3 Bucket Status
```bash
# List files in bucket
aws s3 ls s3://sabpaisa-admin-staging/ \
  --recursive \
  --profile chaitanya-staging-2

# Check bucket size
aws s3 ls s3://sabpaisa-admin-staging/ \
  --recursive \
  --human-readable \
  --summarize \
  --profile chaitanya-staging-2
```

## Troubleshooting

### Common Issues

**1. React 19 Peer Dependency Errors**
- **Solution**: Use `npm ci --legacy-peer-deps`

**2. CloudFront 502 Errors**
- **Cause**: Incorrect origin domain name
- **Solution**: Verify origin is `s3-website.ap-south-1.amazonaws.com` (with dot)

**3. 404 on Page Refresh**
- **Cause**: SPA routing not configured
- **Solution**: CloudFront custom error responses redirect 404/403 to `/index.html`

**4. Cache Not Updating**
- **Cause**: CloudFront cache not invalidated
- **Solution**: Run cache invalidation after deployment

## Cost Estimate

**Monthly Cost** (~$5-10):
- S3 Storage (1-2GB): ~$0.023/GB = $0.05
- S3 Requests: ~$0.05
- CloudFront Data Transfer (first 10TB free in India)
- CloudFront Requests (first 10M free)

## Next.js Configuration

**Important Settings**:
```javascript
// next.config.js
const nextConfig = {
  output: 'export', // Static export
  images: {
    unoptimized: true // Required for static export
  }
};
```

**Force Static Pages**:
```javascript
// app/manifest.ts
export const dynamic = "force-static";
```

## Rollback Process

To rollback to a previous version:

```bash
# 1. Checkout previous commit
git checkout <previous-commit-hash>

# 2. Trigger deployment
git push origin staging --force
```

Or restore from S3 versioning (if enabled).

## Additional Notes

- **Branch**: Only `staging` branch auto-deploys
- **Repository**: https://github.com/cm11000000/admin_frontend
- **Framework**: Next.js 15 with React 19
- **Build Time**: ~2-3 minutes
- **Deployment Time**: ~1-2 minutes
- **Total Time**: ~5 minutes from push to live

---
Last Updated: 2025-10-25
