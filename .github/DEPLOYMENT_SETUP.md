# GitHub Actions Deployment Setup

## Overview

This repository uses GitHub Actions to automatically deploy to AWS S3 + CloudFront on every push to the `staging` branch.

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Staging Environment

| Secret Name | Description | Value |
|------------|-------------|-------|
| `STAGING_AWS_ACCESS_KEY_ID` | AWS Access Key ID | `AKIAYZZGTDOXIRTE65UJ` |
| `STAGING_AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | `UEP048yc0oTPJ+HjvV6riFTMR7bRmn3ngjNy4MCG` |
| `STAGING_S3_BUCKET` | S3 bucket name for staging | `sabpaisa-admin-staging` (or your choice) |
| `STAGING_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (optional initially) | Leave empty for now |

---

## Setup Steps

### 1. Add GitHub Secrets

```bash
# Go to your repository on GitHub
https://github.com/cm11000000/admin_frontend/settings/secrets/actions

# Click "New repository secret" and add each secret above
```

### 2. Create S3 Bucket (Optional - workflow will create it)

The GitHub Actions workflow will automatically create the S3 bucket if it doesn't exist. But if you want to create it manually:

```bash
# Using the chaitanya-staging-2 profile
aws s3api create-bucket \
  --bucket sabpaisa-admin-staging \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1 \
  --profile chaitanya-staging-2

# Enable static website hosting
aws s3 website s3://sabpaisa-admin-staging \
  --index-document index.html \
  --error-document 404.html \
  --profile chaitanya-staging-2

# Make bucket public for website hosting
aws s3api put-bucket-policy \
  --bucket sabpaisa-admin-staging \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sabpaisa-admin-staging/*"
    }]
  }' \
  --profile chaitanya-staging-2
```

### 3. Create CloudFront Distribution (Optional but Recommended)

```bash
# This provides HTTPS access and global CDN
aws cloudfront create-distribution \
  --origin-domain-name sabpaisa-admin-staging.s3-website-ap-south-1.amazonaws.com \
  --default-root-object index.html \
  --profile chaitanya-staging-2

# After creation, copy the Distribution ID and add it to GitHub secrets as:
# STAGING_CLOUDFRONT_DISTRIBUTION_ID
```

Or use the AWS Console:
1. Go to CloudFront → Create Distribution
2. Origin Domain: `sabpaisa-admin-staging.s3-website-ap-south-1.amazonaws.com`
3. Viewer Protocol Policy: Redirect HTTP to HTTPS
4. Default Root Object: `index.html`
5. Copy the Distribution ID and add to GitHub secrets

---

## Deployment Workflow

### Automatic Deployment

Every push to the `staging` branch triggers automatic deployment:

```bash
git checkout staging
git add .
git commit -m "Update staging deployment"
git push origin staging
```

The workflow will:
1. ✅ Build the Next.js static export
2. ✅ Upload files to S3 with proper cache headers
3. ✅ Invalidate CloudFront cache (if configured)
4. ✅ Provide deployment summary

### Manual Deployment

You can also trigger deployment manually:
1. Go to Actions tab in GitHub
2. Select "Deploy to Staging (S3 + CloudFront)"
3. Click "Run workflow"
4. Select `staging` branch
5. Click "Run workflow"

---

## Branch Strategy

- **`main`** - Production (future: deploy to production environment)
- **`staging`** - Staging environment (auto-deploys to S3 + CloudFront)
- **Feature branches** - Development work (no auto-deploy)

---

## Troubleshooting

### Build Fails

Check the Actions tab for error logs. Common issues:
- TypeScript errors
- Missing dependencies
- Environment variables

### Deployment Fails

- Verify AWS credentials are correct in GitHub Secrets
- Check S3 bucket permissions
- Ensure CloudFront distribution exists (if ID is provided)

### Changes Not Visible

- Wait 1-2 minutes for CloudFront cache invalidation
- Check CloudFront invalidation status in AWS Console
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

---

## Monitoring

### Check Deployment Status

- **GitHub Actions**: https://github.com/cm11000000/admin_frontend/actions
- **S3 Console**: https://s3.console.aws.amazon.com/s3/buckets/sabpaisa-admin-staging
- **CloudFront Console**: https://console.aws.amazon.com/cloudfront

### Access Staging Site

- **S3 Website URL**: http://sabpaisa-admin-staging.s3-website-ap-south-1.amazonaws.com
- **CloudFront URL**: https://[your-distribution-id].cloudfront.net (after setup)
- **Custom Domain**: Configure in CloudFront (optional)

---

## Cost Estimate

**Staging Environment:**
- S3 Storage: ~$0.023/GB/month
- S3 Requests: ~$0.005/1000 requests
- CloudFront: ~$0.085/GB transfer
- **Total**: ~$2-5/month (for typical staging usage)

---

## Security Notes

⚠️ **NEVER commit AWS credentials to the repository!**
- Always use GitHub Secrets for sensitive data
- Rotate credentials regularly
- Use least-privilege IAM policies
