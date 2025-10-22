#!/bin/bash

# Fix Content-Type for all HTML files in S3 bucket
BUCKET_NAME="sabpaisa-admin-v5-20251010"
PROFILE="chaitanya-rnd"

echo "🔧 Fixing Content-Type for HTML files in S3..."
echo "=============================================="

# Fix all HTML files
echo "📝 Updating HTML files to text/html..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.html" \
    --profile $PROFILE \
    --metadata-directive REPLACE \
    --content-type "text/html" \
    --cache-control "public, max-age=0, must-revalidate"

# Fix CSS files
echo "🎨 Updating CSS files to text/css..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --profile $PROFILE \
    --metadata-directive REPLACE \
    --content-type "text/css" \
    --cache-control "public, max-age=31536000, immutable"

# Fix JS files
echo "📜 Updating JS files to application/javascript..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --profile $PROFILE \
    --metadata-directive REPLACE \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000, immutable"

# Fix JSON files
echo "📋 Updating JSON files to application/json..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.json" \
    --profile $PROFILE \
    --metadata-directive REPLACE \
    --content-type "application/json"

# Fix image files
echo "🖼️  Updating image files..."
for ext in png jpg jpeg gif svg ico webp; do
    case $ext in
        svg)
            content_type="image/svg+xml"
            ;;
        ico)
            content_type="image/x-icon"
            ;;
        *)
            content_type="image/$ext"
            ;;
    esac

    aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
        --recursive \
        --exclude "*" \
        --include "*.$ext" \
        --profile $PROFILE \
        --metadata-directive REPLACE \
        --content-type "$content_type" \
        --cache-control "public, max-age=31536000, immutable" 2>/dev/null
done

echo ""
echo "✅ Content-Type headers fixed!"
echo ""

# Invalidate CloudFront cache
DISTRIBUTION_ID="E3A630N588UPWD"
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --profile $PROFILE \
    --query 'Invalidation.Id' \
    --output text

echo ""
echo "✅ CloudFront cache invalidated!"
echo "⏳ Wait 1-2 minutes for the changes to take effect"
echo ""
echo "🧪 Test the HTTPS URL again:"
echo "   https://d3ltikj36wzl4t.cloudfront.net/login/"