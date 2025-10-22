#!/bin/bash

# Cross-account subdomain creation
# Uses OrganizationAccountAccessRole to access master account Route53

HOSTED_ZONE_ID="Z06541923RERTQXE41XSI"
SUBDOMAIN="admin.rnd.sabpaisa.in"
CLOUDFRONT_DOMAIN="d3ltikj36wzl4t.cloudfront.net"
MASTER_ACCOUNT="070658298707"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       🌐 CREATING SUBDOMAIN IN MASTER ACCOUNT                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Step 1: Assume role in master account
echo "🔄 Assuming role in master account $MASTER_ACCOUNT..."
TEMP_CREDS=$(aws sts assume-role \
  --role-arn "arn:aws:iam::$MASTER_ACCOUNT:role/OrganizationAccountAccessRole" \
  --role-session-name "Route53SubdomainCreation" \
  --profile chaitanya-rnd \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text)

if [ $? -ne 0 ]; then
    echo "❌ Failed to assume role in master account"
    echo "   The OrganizationAccountAccessRole might not exist or you don't have permission"
    exit 1
fi

ACCESS_KEY=$(echo "$TEMP_CREDS" | cut -f1)
SECRET_KEY=$(echo "$TEMP_CREDS" | cut -f2)
SESSION_TOKEN=$(echo "$TEMP_CREDS" | cut -f3)

# Step 2: Configure temporary profile
echo "⚙️  Setting up temporary profile for master account access..."
aws configure set aws_access_key_id "$ACCESS_KEY" --profile temp-route53
aws configure set aws_secret_access_key "$SECRET_KEY" --profile temp-route53
aws configure set aws_session_token "$SESSION_TOKEN" --profile temp-route53
aws configure set region ap-south-1 --profile temp-route53

# Step 3: Create Route53 CNAME record
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

echo "📝 Creating CNAME record in master account:"
echo "   $SUBDOMAIN → $CLOUDFRONT_DOMAIN"
echo

# Apply Route53 change using temporary profile
CHANGE_ID=$(aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://route53-cname.json \
  --profile temp-route53 \
  --query 'ChangeInfo.Id' \
  --output text)

if [ $? -eq 0 ]; then
  echo "✅ DNS record created successfully in master account!"
  echo "   Change ID: $CHANGE_ID"
  echo
  echo "⏳ DNS propagation typically takes 1-5 minutes"
  echo
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                   🎉 SUBDOMAIN CREATED!                       ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo
  echo "📌 IMPORTANT NOTES:"
  echo
  echo "1. SSL Certificate Warning:"
  echo "   Since CloudFront doesn't have '$SUBDOMAIN' configured,"
  echo "   browsers will show certificate warnings when accessing:"
  echo "   https://$SUBDOMAIN"
  echo
  echo "2. Working HTTPS URL (No warnings):"
  echo "   ✅ https://$CLOUDFRONT_DOMAIN"
  echo
  echo "3. HTTP Access (Redirects to HTTPS):"
  echo "   http://$SUBDOMAIN → Will work after DNS propagation"
  echo
  echo "🔍 Test DNS propagation:"
  echo "   nslookup $SUBDOMAIN"
  echo "   dig $SUBDOMAIN"
  echo
  echo "📊 Check DNS status:"
  echo "   aws route53 get-change --id $CHANGE_ID --profile chaitanya-rnd"
else
  echo "❌ Failed to create DNS record in master account"
fi

# Clean up
rm -f route53-cname.json
aws configure --profile temp-route53 set aws_access_key_id ""
aws configure --profile temp-route53 set aws_secret_access_key ""
aws configure --profile temp-route53 set aws_session_token ""

echo
echo "🧹 Cleaned up temporary credentials"