#!/bin/bash

# Custom domain setup for SabPaisa Admin Portal

DOMAIN="admin.rnd.sabpaisa.in"
CLOUDFRONT_ID="E3A630N588UPWD"
CLOUDFRONT_DOMAIN="d3ltikj36wzl4t.cloudfront.net"
HOSTED_ZONE_ID="Z07148092Z1O2UHR8UBHQ"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       🌐 SETTING UP CUSTOM DOMAIN: $DOMAIN          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Step 1: Update CloudFront to accept the alternate domain
echo "📝 Step 1: Updating CloudFront to accept alternate domain..."
echo "   Adding: $DOMAIN"

# Get current distribution config
aws cloudfront get-distribution-config --id $CLOUDFRONT_ID --profile chaitanya-rnd > temp-dist-config.json

# Extract ETag
ETAG=$(jq -r '.ETag' temp-dist-config.json)

# Update the config to add alternate domain
jq --arg domain "$DOMAIN" '.DistributionConfig.Aliases = {Quantity: 1, Items: [$domain]}' temp-dist-config.json | jq '.DistributionConfig' > updated-dist-config.json

# Apply the update
aws cloudfront update-distribution \
  --id $CLOUDFRONT_ID \
  --distribution-config file://updated-dist-config.json \
  --if-match "$ETAG" \
  --profile chaitanya-rnd > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "   ✅ CloudFront updated to accept $DOMAIN"
else
  echo "   ❌ Failed to update CloudFront"
  exit 1
fi

echo
echo "📝 Step 2: Creating Route53 DNS record..."
echo "   Domain: $DOMAIN"
echo "   Target: $CLOUDFRONT_DOMAIN"

# Create Route53 record
cat > route53-change.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$DOMAIN",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$CLOUDFRONT_DOMAIN"
          }
        ]
      }
    }
  ]
}
EOF

# Apply Route53 change
CHANGE_ID=$(aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://route53-change.json \
  --profile chaitanya-rnd \
  --query 'ChangeInfo.Id' \
  --output text)

if [ $? -eq 0 ]; then
  echo "   ✅ DNS record created successfully"
  echo "   Change ID: $CHANGE_ID"
else
  echo "   ❌ Failed to create DNS record"
  exit 1
fi

echo
echo "⏳ Step 3: Waiting for CloudFront to update..."
echo "   This typically takes 5-15 minutes"

# Check distribution status
STATUS=$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --profile chaitanya-rnd --query 'Distribution.Status' --output text)
echo "   Current status: $STATUS"

if [ "$STATUS" = "InProgress" ]; then
  echo "   CloudFront is updating globally..."
fi

echo
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   🎉 SETUP COMPLETE!                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "🔒 YOUR CUSTOM HTTPS URL (will be ready in 5-15 minutes):"
echo "═══════════════════════════════════════════════════════════"
echo "   https://$DOMAIN"
echo "═══════════════════════════════════════════════════════════"
echo
echo "📱 Access your admin portal at:"
echo "   • Login:        https://$DOMAIN/login/"
echo "   • Dashboard:    https://$DOMAIN/dashboard/"
echo "   • Clients:      https://$DOMAIN/clients/"
echo "   • Transactions: https://$DOMAIN/transactions/"
echo "   • Reports:      https://$DOMAIN/reports/"
echo
echo "🧪 Test DNS propagation:"
echo "   nslookup $DOMAIN"
echo "   dig $DOMAIN"
echo
echo "🔍 Test HTTPS once ready:"
echo "   curl -I https://$DOMAIN/login/"
echo
echo "📝 Note: DNS propagation typically takes 1-5 minutes"
echo "         CloudFront update takes 5-15 minutes"

# Clean up
rm -f temp-dist-config.json updated-dist-config.json route53-change.json