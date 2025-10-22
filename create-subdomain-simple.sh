#!/bin/bash

# Simple subdomain creation without CloudFront custom domain
# Just creates a CNAME record pointing to CloudFront

HOSTED_ZONE_ID="Z06541923RERTQXE41XSI"
SUBDOMAIN="admin.rnd.sabpaisa.in"
CLOUDFRONT_DOMAIN="d3ltikj36wzl4t.cloudfront.net"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       🌐 CREATING SUBDOMAIN FOR ADMIN PORTAL                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Create Route53 CNAME record
cat > route53-cname.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$SUBDOMAIN",
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

echo "📝 Creating CNAME record:"
echo "   $SUBDOMAIN → $CLOUDFRONT_DOMAIN"
echo

# Apply Route53 change using chaitanya-rnd profile (has access to shared resources)
CHANGE_ID=$(aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://route53-cname.json \
  --profile chaitanya-rnd \
  --query 'ChangeInfo.Id' \
  --output text)

if [ $? -eq 0 ]; then
  echo "✅ DNS record created successfully!"
  echo "   Change ID: $CHANGE_ID"
  echo
  echo "⏳ DNS propagation typically takes 1-5 minutes"
  echo
  echo "📌 IMPORTANT NOTE:"
  echo "   Since CloudFront doesn't have this domain in its alternate names,"
  echo "   you may see SSL certificate warnings when accessing via:"
  echo "   https://$SUBDOMAIN"
  echo
  echo "🌐 The subdomain will redirect to CloudFront but show certificate mismatch."
  echo "   For proper HTTPS, use the direct CloudFront URL:"
  echo "   https://$CLOUDFRONT_DOMAIN"
  echo
  echo "🔍 Test DNS propagation:"
  echo "   nslookup $SUBDOMAIN"
  echo "   dig $SUBDOMAIN"
else
  echo "❌ Failed to create DNS record"
  echo "   Check if you have Route53 permissions in the shared account"
fi

# Clean up
rm -f route53-cname.json