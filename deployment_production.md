# Production Deployment Documentation - Frontend V2

## Overview
The Frontend V2 (Next.js 15) is deployed to AWS S3 + CloudFront CDN with automatic CI/CD via GitHub Actions.

## Infrastructure

### AWS Account
- **Profile**: `chaitanya-prod-1`
- **Account ID**: `077852359894`
- **Region**: `ap-south-1` (Mumbai)

### AWS Services

#### S3 Bucket
- **Bucket Name**: `admin-v2.sabpaisa.in`
- **Region**: `ap-south-1`
- **Static Website Hosting**: Enabled
- **Index Document**: `index.html`
- **Error Document**: `index.html` (for SPA routing)
- **Public Access**:
  - Block Public ACLs: `true`
  - Ignore Public ACLs: `true`
  - Block Public Policy: `false` (allows public bucket policy)
  - Restrict Public Buckets: `false` (allows public access)
- **Bucket Policy**: Public read access for all objects

#### CloudFront Distribution
- **Distribution ID**: `EGCFUEYM05WTD`
- **Domain**: `d1xzmfw9e4a2at.cloudfront.net`
- **Comment**: `Admin Portal V2`
- **Status**: Deployed
- **Origin**: `admin-v2.sabpaisa.in.s3.ap-south-1.amazonaws.com`
- **Origin Path**: `/`
- **Default Root Object**: `index.html`
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed Methods**: GET, HEAD
- **Compression**: Enabled
- **Custom Error Responses**:
  - 403 → `/index.html` (HTTP 200) - For SPA routing
  - 404 → `/index.html` (HTTP 200) - For SPA routing
- **SSL**: Enabled (CloudFront default certificate)

### Access URLs

#### HTTPS (CloudFront - Primary)
```
https://d1xzmfw9e4a2at.cloudfront.net
```
- **Status**: ✅ Live
- **SSL**: Enabled (TLS 1.2+)
- **Compression**: Enabled
- **Global CDN**: Yes

#### HTTP (S3 Direct - Fallback)
```
http://admin-v2.sabpaisa.in.s3-website-ap-south-1.amazonaws.com
```
- **Status**: ✅ Live
- **SSL**: Not available
- **Use Case**: Direct S3 access for testing

**Note**: Use CloudFront HTTPS URL for production access. S3 HTTP URL is for direct testing only.

## Deployment Process

### Automatic Deployment (GitHub Actions)

**Trigger**: Push to `production` branch

**Workflow File**: `.github/workflows/deploy-production.yml`

**Steps**:
1. **Checkout code** from GitHub
2. **Setup Node.js 18**
3. **Install dependencies** with `npm ci --legacy-peer-deps`
4. **Build static export** with `npm run build:static`
   - Output directory: `out/`
   - All pages force-static
   - Images unoptimized (for static export)
5. **Configure AWS credentials** from GitHub Secrets
6. **Create S3 bucket** (if not exists)
   - Enable static website hosting
   - Set public read policy
7. **Deploy to S3**
   - Upload JS/CSS/JSON with 1-year cache (`max-age=31536000, immutable`)
   - Upload HTML with no-cache (`max-age=0, must-revalidate`)
   - Delete removed files (`--delete`)
8. **Create/Update CloudFront distribution**
   - Auto-creates on first run
   - Comment: "Admin Portal V2"
9. **Invalidate CloudFront cache** (`/*`)
10. **Deployment summary** in GitHub Actions

**Build Time**: ~2-3 minutes
**Upload Time**: ~1 minute
**CloudFront Invalidation**: ~1-2 minutes
**Total Time**: ~5-7 minutes (subsequent deployments)
**First Deployment**: ~15-20 minutes (includes CloudFront creation)

### Manual Deployment

```bash
# 1. Build the application locally
cd /Users/chaitanyamalik/Desktop/admin_full_proper_v2/sabpaisa_admin_v5
npm ci --legacy-peer-deps
npm run build:static

# 2. Configure AWS CLI
aws configure --profile chaitanya-prod-1

# 3. Sync to S3 (with proper caching)
# Upload assets with long cache
aws s3 sync out/ s3://admin-v2.sabpaisa.in/ \
  --delete \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --profile chaitanya-prod-1

# Upload HTML files with no cache
aws s3 sync out/ s3://admin-v2.sabpaisa.in/ \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --profile chaitanya-prod-1

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EGCFUEYM05WTD \
  --paths "/*" \
  --profile chaitanya-prod-1
```

## GitHub Actions Configuration

### GitHub Secrets

The following secrets must be set in the repository:

```
PROD_AWS_ACCESS_KEY_ID
  Description: AWS Access Key ID for production deployment
  Value: [Set via GitHub repository settings]

PROD_AWS_SECRET_ACCESS_KEY
  Description: AWS Secret Access Key for production deployment
  Value: [Set via GitHub repository settings]
```

**How to set secrets:**
1. Go to: https://github.com/cm11000000/admin_frontend/settings/secrets/actions
2. Click "New repository secret"
3. Add both secrets

**Or via GitHub CLI:**
```bash
gh secret set PROD_AWS_ACCESS_KEY_ID --body "YOUR_ACCESS_KEY"
gh secret set PROD_AWS_SECRET_ACCESS_KEY --body "YOUR_SECRET_KEY"
```

### Environment Variables (in workflow)

```yaml
AWS_REGION: ap-south-1
NODE_VERSION: '18'
PROD_S3_BUCKET: admin-v2.sabpaisa.in
# PROD_CLOUDFRONT_DISTRIBUTION_ID: EGCFUEYM05WTD (optional - for faster lookups)
```

## Monitoring

### GitHub Actions
- **Workflow URL**: https://github.com/cm11000000/admin_frontend/actions
- **Workflow Name**: "Deploy to Production V2 (S3 + CloudFront)"
- **Monitor deployments**: Check workflow runs for status and logs

### AWS Console

#### S3 Bucket
```bash
# Check bucket contents
aws s3 ls s3://admin-v2.sabpaisa.in/ \
  --profile chaitanya-prod-1 \
  --recursive \
  --human-readable \
  --summarize

# Check bucket policy
aws s3api get-bucket-policy \
  --bucket admin-v2.sabpaisa.in \
  --profile chaitanya-prod-1

# Check public access block settings
aws s3api get-public-access-block \
  --bucket admin-v2.sabpaisa.in \
  --profile chaitanya-prod-1
```

#### CloudFront Distribution
```bash
# Check distribution status
aws cloudfront get-distribution \
  --id EGCFUEYM05WTD \
  --profile chaitanya-prod-1 \
  --query 'Distribution.[Id,DomainName,Status]'

# Check recent invalidations
aws cloudfront list-invalidations \
  --distribution-id EGCFUEYM05WTD \
  --profile chaitanya-prod-1 \
  --max-items 5

# Monitor CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=EGCFUEYM05WTD \
  --start-time 2025-10-28T00:00:00Z \
  --end-time 2025-10-28T23:59:59Z \
  --period 3600 \
  --statistics Sum \
  --profile chaitanya-prod-1
```

### Health Check

```bash
# Test CloudFront endpoint (HTTPS)
curl -I https://d1xzmfw9e4a2at.cloudfront.net

# Test S3 website endpoint (HTTP)
curl -I http://admin-v2.sabpaisa.in.s3-website-ap-south-1.amazonaws.com

# Expected response: HTTP 200
# Content-Type: text/html
```

## Troubleshooting

### Common Issues

**1. Build Failures (React 19 Peer Dependencies)**
```bash
# Solution: Use --legacy-peer-deps flag
npm ci --legacy-peer-deps
npm run build:static
```

**Error message:**
```
npm ERR! peer react@"^18.0.0" from package
```

**2. S3 Bucket Policy Denied**
```bash
# Error: AccessDenied when calling PutBucketPolicy
# Cause: BlockPublicPolicy is enabled

# Solution: Disable block public policy
aws s3api put-public-access-block \
  --bucket admin-v2.sabpaisa.in \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
  }' \
  --profile chaitanya-prod-1
```

**3. CloudFront 403 Errors on Refresh**
- **Cause**: SPA routing not configured
- **Solution**: Custom error responses already configured in CloudFront
  - 403 → `/index.html` (HTTP 200)
  - 404 → `/index.html` (HTTP 200)

**4. CloudFront Not Serving Latest Content**
- **Cause**: Cache not invalidated
- **Solution**: Create cache invalidation
```bash
aws cloudfront create-invalidation \
  --distribution-id EGCFUEYM05WTD \
  --paths "/*" \
  --profile chaitanya-prod-1
```

**5. GitHub Actions Deployment Fails (Secrets Not Found)**
- **Cause**: GitHub Secrets not configured
- **Solution**: Add secrets to repository settings
  - Go to: https://github.com/cm11000000/admin_frontend/settings/secrets/actions
  - Add `PROD_AWS_ACCESS_KEY_ID` and `PROD_AWS_SECRET_ACCESS_KEY`

### Rollback Process

**Option 1: Revert Git and Redeploy**
```bash
git revert <bad-commit>
git push origin production
# Wait for GitHub Actions to redeploy
```

**Option 2: Restore from Previous S3 Version** (if versioning enabled)
```bash
# Enable versioning first (if not already)
aws s3api put-bucket-versioning \
  --bucket admin-v2.sabpaisa.in \
  --versioning-configuration Status=Enabled \
  --profile chaitanya-prod-1

# List object versions
aws s3api list-object-versions \
  --bucket admin-v2.sabpaisa.in \
  --profile chaitanya-prod-1

# Restore specific version
aws s3api copy-object \
  --copy-source admin-v2.sabpaisa.in/<key>?versionId=<version-id> \
  --bucket admin-v2.sabpaisa.in \
  --key <key> \
  --profile chaitanya-prod-1
```

**Option 3: Deploy Previous Build Manually**
```bash
# Checkout previous commit
git checkout <previous-commit-hash>

# Build and deploy
npm ci --legacy-peer-deps
npm run build:static
aws s3 sync out/ s3://admin-v2.sabpaisa.in/ --delete --profile chaitanya-prod-1
aws cloudfront create-invalidation --distribution-id EGCFUEYM05WTD --paths "/*" --profile chaitanya-prod-1
```

## Cost Breakdown

**Monthly Costs** (~$5-10):
- **S3 Storage**: ~$0.02/GB × 11.2 MB = $0.0002/month
- **S3 Requests**: ~$0.004/1000 PUT + $0.0004/1000 GET = ~$0.50/month
- **CloudFront Data Transfer**:
  - First 10 TB: $0.085/GB
  - Estimate for 100 GB/month: ~$8.50/month
- **CloudFront Requests**:
  - First 10M: $0.0075/10000
  - Estimate for 1M requests/month: ~$0.75/month
- **Total**: ~$10-15/month (varies with traffic)

**Note**: Costs are much lower for typical admin portal usage (low traffic).

## Next.js Configuration

**Important Settings** (next.config.mjs):
```javascript
const nextConfig = {
  output: 'export', // Static export mode
  images: {
    unoptimized: true // Required for static export
  },
  // Disable server features
  trailingSlash: false
};
```

**Force Static Pages** (app/manifest.ts):
```javascript
export const dynamic = "force-static";
```

**Build Script** (package.json):
```json
{
  "scripts": {
    "build:static": "next build"
  }
}
```

## DNS Configuration (Optional)

### Current Setup
- **CloudFront URL**: `d1xzmfw9e4a2at.cloudfront.net`
- **Custom Domain**: Not configured yet
- **Access**: Via CloudFront URL only

### To Add Custom Domain (admin-v2.sabpaisa.in)

**Prerequisites**:
- SSL certificate for `admin-v2.sabpaisa.in` in AWS ACM (us-east-1)
- Access to Cloudflare DNS for sabpaisa.in

**Steps**:

1. **Request SSL Certificate (AWS Certificate Manager)**
```bash
# Must be in us-east-1 for CloudFront
aws acm request-certificate \
  --domain-name admin-v2.sabpaisa.in \
  --validation-method DNS \
  --region us-east-1 \
  --profile chaitanya-prod-1
```

2. **Add DNS Validation Record in Cloudflare**
- Get validation CNAME from ACM
- Add to Cloudflare DNS
- Wait for certificate validation

3. **Update CloudFront Distribution**
```bash
# Add alternate domain name and certificate
aws cloudfront update-distribution \
  --id EGCFUEYM05WTD \
  --distribution-config <updated-config-with-alias-and-cert> \
  --profile chaitanya-prod-1
```

4. **Add CNAME in Cloudflare**
```
Type: CNAME
Name: admin-v2
Target: d1xzmfw9e4a2at.cloudfront.net
Proxy: OFF (Grey Cloud ☁️🔘)
TTL: Auto
```

## Architecture Comparison: V1 vs V2

### V1 (Current Production - admin.sabpaisa.in)
```
Cloudflare (Proxied) → CloudFront → S3 (admin.sabpaisa.in)
  - Custom domain: admin.sabpaisa.in
  - Cloudflare proxy: ON (Orange)
  - CloudFront distribution: E1U9O1YV3HUIG1
```

### V2 (New Production - admin-v2)
```
Direct → CloudFront → S3 (admin-v2.sabpaisa.in)
  - CloudFront URL: d1xzmfw9e4a2at.cloudfront.net
  - No custom domain yet
  - CloudFront distribution: EGCFUEYM05WTD
```

**Key Differences**:
- V2 uses CloudFront URL directly (no custom domain)
- V2 not proxied through Cloudflare
- V2 has separate S3 bucket and CloudFront distribution
- V2 fully automated via GitHub Actions

## Security Considerations

### Current Configuration
- ✅ S3 bucket policy allows public read access (required for static website)
- ✅ Block Public ACLs: Enabled (prevents accidental ACL changes)
- ✅ CloudFront HTTPS enforced
- ✅ AWS credentials stored in GitHub Secrets (encrypted)
- ✅ Repository is private

### Recommendations for Production
- Consider enabling S3 versioning for rollback capability
- Set up CloudWatch alarms for CloudFront errors
- Enable CloudFront access logs for monitoring
- Configure WAF (Web Application Firewall) for DDoS protection
- Use CloudFront Origin Access Identity (OAI) instead of public bucket policy
- Rotate AWS credentials regularly
- Enable MFA for AWS account

## Performance Optimizations

### Current Optimizations
- ✅ **Asset Caching**: JS/CSS cached for 1 year (immutable)
- ✅ **HTML No-Cache**: Ensures users always get latest version
- ✅ **CloudFront Compression**: Gzip enabled
- ✅ **Global CDN**: CloudFront edge locations worldwide
- ✅ **Static Export**: No server-side rendering overhead

### Additional Optimizations (Optional)
- Enable Brotli compression in CloudFront
- Configure CloudFront cache behaviors for specific paths
- Use CloudFront Functions for edge logic
- Implement service worker for offline support
- Set up preconnect/prefetch hints

## Additional Notes

- **Branch**: Only `production` branch auto-deploys
- **Repository**: https://github.com/cm11000000/admin_frontend
- **Framework**: Next.js 15 with React 19
- **Build Output**: Static HTML/JS/CSS (no server)
- **Deployment**: Fully automated via GitHub Actions
- **Zero Downtime**: New files uploaded, cache invalidated
- **Coexistence**: V1 (admin.sabpaisa.in) and V2 run independently

## IAM Permissions Required

The deployment user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketManagement",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:HeadBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutPublicAccessBlock",
        "s3:GetPublicAccessBlock"
      ],
      "Resource": [
        "arn:aws:s3:::admin-v2.sabpaisa.in",
        "arn:aws:s3:::admin-v2.sabpaisa.in/*"
      ]
    },
    {
      "Sid": "CloudFrontManagement",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:ListDistributions",
        "cloudfront:UpdateDistribution",
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
```

---
Last Updated: 2025-10-28 — Initial V2 production deployment
