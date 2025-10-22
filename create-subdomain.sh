#!/bin/bash

# Developer Script to Create Subdomains
# This script helps developers create subdomains in rnd.sabpaisa.in

# Configuration
MASTER_ACCOUNT="070658298707"
HOSTED_ZONE_ID="Z06541923RERTQXE41XSI"
ROLE_ARN="arn:aws:iam::$MASTER_ACCOUNT:role/DeveloperDNSRole"
EXTERNAL_ID="sabpaisa-dns-access"
BASE_DOMAIN="rnd.sabpaisa.in"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🌐 CREATE SUBDOMAIN IN RND.SABPAISA.IN                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Check if subdomain and target are provided
if [ $# -lt 2 ]; then
  echo "Usage: $0 <subdomain> <target> [record-type]"
  echo
  echo "Examples:"
  echo "  $0 admin d3ltikj36wzl4t.cloudfront.net CNAME"
  echo "  $0 api 13.232.67.89 A"
  echo "  $0 settlepaisa your-cloudfront.net CNAME"
  echo
  echo "This will create: <subdomain>.rnd.sabpaisa.in → <target>"
  exit 1
fi

SUBDOMAIN=$1
TARGET=$2
RECORD_TYPE=${3:-CNAME}  # Default to CNAME if not specified

# Validate subdomain
if [[ "$SUBDOMAIN" == *"."* ]]; then
  echo "❌ Error: Subdomain should not contain dots"
  echo "   Just provide the subdomain name (e.g., 'admin', not 'admin.rnd.sabpaisa.in')"
  exit 1
fi

FULL_DOMAIN="${SUBDOMAIN}.${BASE_DOMAIN}"

echo "📋 Configuration:"
echo "   Subdomain: $FULL_DOMAIN"
echo "   Target: $TARGET"
echo "   Record Type: $RECORD_TYPE"
echo

# Step 1: Assume cross-account role
echo "🔑 Step 1: Assuming cross-account role..."

TEMP_CREDS=$(aws sts assume-role \
  --role-arn "$ROLE_ARN" \
  --role-session-name "CreateSubdomain-$SUBDOMAIN" \
  --external-id "$EXTERNAL_ID" \
  --profile chaitanya-rnd \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Failed to assume role"
  echo "   Error: $TEMP_CREDS"
  echo
  echo "📝 Troubleshooting:"
  echo "   1. Ensure the admin has run 'setup-developer-dns-role.sh'"
  echo "   2. Verify your AWS credentials are configured"
  echo "   3. Check if you have permission to assume the role"
  exit 1
fi

# Parse credentials
ACCESS_KEY=$(echo "$TEMP_CREDS" | cut -f1)
SECRET_KEY=$(echo "$TEMP_CREDS" | cut -f2)
SESSION_TOKEN=$(echo "$TEMP_CREDS" | cut -f3)

# Configure temporary profile
aws configure set aws_access_key_id "$ACCESS_KEY" --profile temp-dns
aws configure set aws_secret_access_key "$SECRET_KEY" --profile temp-dns
aws configure set aws_session_token "$SESSION_TOKEN" --profile temp-dns
aws configure set region ap-south-1 --profile temp-dns

echo "✅ Role assumed successfully"

# Step 2: Check if subdomain already exists
echo
echo "🔍 Step 2: Checking if subdomain already exists..."

EXISTING=$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Name=='${FULL_DOMAIN}.'].Name" \
  --profile temp-dns \
  --output text 2>/dev/null)

if [ -n "$EXISTING" ]; then
  echo "⚠️  Warning: Subdomain '$FULL_DOMAIN' already exists"
  echo -n "   Do you want to update it? (y/n): "
  read -r CONFIRM
  if [ "$CONFIRM" != "y" ]; then
    echo "❌ Cancelled"
    exit 0
  fi
fi

# Step 3: Create/Update DNS record
echo
echo "📝 Step 3: Creating DNS record..."

# Create change batch JSON
if [ "$RECORD_TYPE" = "A" ]; then
  # For A records, TARGET should be an IP address
  cat > change-batch.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$FULL_DOMAIN",
        "Type": "$RECORD_TYPE",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "$TARGET"}
        ]
      }
    }
  ]
}
EOF
else
  # For CNAME records
  cat > change-batch.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$FULL_DOMAIN",
        "Type": "$RECORD_TYPE",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "$TARGET"}
        ]
      }
    }
  ]
}
EOF
fi

# Apply the change
CHANGE_ID=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://change-batch.json \
  --profile temp-dns \
  --query 'ChangeInfo.Id' \
  --output text 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ DNS record created successfully!"
  echo "   Change ID: $CHANGE_ID"
else
  echo "❌ Failed to create DNS record"
  echo "   Error: $CHANGE_ID"
  echo
  echo "📝 Common issues:"
  echo "   - Trying to delete records (not allowed)"
  echo "   - Modifying root domain (not allowed)"
  echo "   - Invalid record format"
  exit 1
fi

# Clean up
rm -f change-batch.json
aws configure --profile temp-dns set aws_access_key_id ""
aws configure --profile temp-dns set aws_secret_access_key ""
aws configure --profile temp-dns set aws_session_token ""

echo
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  🎉 SUBDOMAIN CREATED!                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "📌 DNS Record Details:"
echo "   URL: http://$FULL_DOMAIN"
echo "   Type: $RECORD_TYPE"
echo "   Target: $TARGET"
echo "   TTL: 300 seconds"
echo
echo "⏳ DNS propagation typically takes 1-5 minutes"
echo
echo "🔍 Test your subdomain:"
echo "   nslookup $FULL_DOMAIN"
echo "   dig $FULL_DOMAIN"
echo "   curl -I http://$FULL_DOMAIN"
echo
echo "📝 Note: If using CloudFront, HTTPS may show certificate warnings"
echo "   unless the subdomain is added to CloudFront's alternate domain names"