#!/bin/bash

# S3 Deployment Script for SabPaisa Admin V5
# ============================================

BUCKET_NAME="sabpaisa-admin-v5-20251010"
PROFILE="chaitanya-rnd"
REGION="ap-south-1"
DISTRIBUTION_ID="E3A630N588UPWD" # CloudFront distribution ID

echo "🚀 Starting deployment to S3..."
echo "================================"

# Step 1: Build the Next.js application
echo "📦 Building static export (Next.js)..."
npm run build:static

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Step 2: Upload to S3 with proper content-types
echo "☁️  Uploading to S3 bucket: $BUCKET_NAME..."

# Upload HTML files with correct content-type
echo "📄 Uploading HTML files..."
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --delete \
    --profile $PROFILE \
    --region $REGION \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html" \
    --cache-control "public, max-age=0, must-revalidate"

# Upload CSS files with correct content-type
echo "🎨 Uploading CSS files..."
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --profile $PROFILE \
    --region $REGION \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --cache-control "public, max-age=31536000, immutable"

# Upload JS files with correct content-type
echo "📜 Uploading JS files..."
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --profile $PROFILE \
    --region $REGION \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000, immutable"

# Upload JSON files with correct content-type
echo "📋 Uploading JSON files..."
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --profile $PROFILE \
    --region $REGION \
    --exclude "*" \
    --include "*.json" \
    --content-type "application/json" \
    --cache-control "public, max-age=31536000, immutable"

# Upload all other files (images, fonts, etc.)
echo "📦 Uploading remaining files..."
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --profile $PROFILE \
    --region $REGION \
    --exclude "*.html" \
    --exclude "*.css" \
    --exclude "*.js" \
    --exclude "*.json" \
    --exclude "*.map" \
    --cache-control "public, max-age=31536000, immutable"

if [ $? -ne 0 ]; then
    echo "❌ S3 sync failed."
    exit 1
fi

echo "✅ All files uploaded with correct content-types!"

# Step 3: Invalidate CloudFront (if distribution ID is set)
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --profile $PROFILE
fi

echo ""
echo "✅ Deployment complete!"
echo "================================"
echo "🌐 HTTP URL: http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
echo "🔒 HTTPS URL: https://d3ltikj36wzl4t.cloudfront.net"
echo ""
echo "📝 Note: CloudFront cache has been invalidated. Changes should appear in 1-2 minutes."
