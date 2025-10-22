#!/bin/bash

echo "🔧 Fixing CloudFront Origin Configuration..."

# Get current config
echo "📥 Getting current distribution config..."
aws cloudfront get-distribution-config --id E3A630N588UPWD --profile chaitanya-rnd > current-dist.json

# Extract ETag
ETAG=$(jq -r '.ETag' current-dist.json)
echo "📝 Current ETag: $ETAG"

# Extract and fix the config
echo "🔧 Updating origin to correct S3 website endpoint..."
jq '.DistributionConfig.Origins.Items[0].DomainName = "sabpaisa-admin-v5-20251010.s3-website.ap-south-1.amazonaws.com"' current-dist.json | jq '.DistributionConfig' > updated-config.json

# Update the distribution
echo "📤 Updating CloudFront distribution..."
aws cloudfront update-distribution \
  --id E3A630N588UPWD \
  --distribution-config file://updated-config.json \
  --if-match "$ETAG" \
  --profile chaitanya-rnd \
  --output json > update-result.json

if [ $? -eq 0 ]; then
  echo "✅ CloudFront origin updated successfully!"
  echo
  echo "⏳ Distribution is updating. This will take 15-20 minutes."
  echo "   The distribution status will change to 'InProgress' then 'Deployed'"
  echo
  echo "📊 Check status with: ./cloudfront-status.sh"
  echo
  echo "🔍 Once deployed, test HTTPS access:"
  echo "   curl -I https://d3ltikj36wzl4t.cloudfront.net/login/"
else
  echo "❌ Failed to update distribution"
  cat update-result.json
fi

# Clean up temp files
rm -f current-dist.json updated-config.json update-result.json