#!/bin/bash

# Setup Script for Developer DNS Access
# Run this in the MASTER ACCOUNT with admin privileges
# This creates a cross-account role that developers can assume

MASTER_ACCOUNT="070658298707"
DEVELOPER_ACCOUNT="408876511992"
HOSTED_ZONE_ID="Z06541923RERTQXE41XSI"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔐 SETUP DEVELOPER DNS ACCESS IN MASTER ACCOUNT           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "This script will create a cross-account IAM role that allows"
echo "developers to create subdomains in rnd.sabpaisa.in"
echo
echo "⚠️  RUN THIS WITH sabpaisa_rnd PROFILE (admin access required)"
echo

# Step 1: Create IAM policy for DNS access
echo "📝 Step 1: Creating IAM policy for restricted DNS access..."

POLICY_ARN=$(aws iam create-policy \
  --policy-name DeveloperDNSPolicy \
  --policy-document file://developer-dns-policy.json \
  --description "Allows developers to create subdomains only (no delete, no root changes)" \
  --profile sabpaisa_rnd \
  --query 'Policy.Arn' \
  --output text 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ Policy created: $POLICY_ARN"
else
  # Policy might already exist
  POLICY_ARN="arn:aws:iam::$MASTER_ACCOUNT:policy/DeveloperDNSPolicy"
  echo "⚠️  Policy might already exist, using: $POLICY_ARN"
fi

# Step 2: Create trust policy for cross-account access
echo
echo "📝 Step 2: Creating trust relationship policy..."

cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::$DEVELOPER_ACCOUNT:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "sabpaisa-dns-access"
        }
      }
    }
  ]
}
EOF

# Step 3: Create IAM role
echo "📝 Step 3: Creating IAM role for developers..."

ROLE_ARN=$(aws iam create-role \
  --role-name DeveloperDNSRole \
  --assume-role-policy-document file://trust-policy.json \
  --description "Cross-account role for developers to manage DNS subdomains" \
  --profile sabpaisa_rnd \
  --query 'Role.Arn' \
  --output text 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ Role created: $ROLE_ARN"
else
  ROLE_ARN="arn:aws:iam::$MASTER_ACCOUNT:role/DeveloperDNSRole"
  echo "⚠️  Role might already exist, using: $ROLE_ARN"
fi

# Step 4: Attach policy to role
echo
echo "📝 Step 4: Attaching policy to role..."

aws iam attach-role-policy \
  --role-name DeveloperDNSRole \
  --policy-arn "$POLICY_ARN" \
  --profile sabpaisa_rnd

if [ $? -eq 0 ]; then
  echo "✅ Policy attached to role successfully!"
else
  echo "⚠️  Policy might already be attached"
fi

# Step 5: Verify setup
echo
echo "📝 Step 5: Verifying setup..."

# List attached policies
ATTACHED=$(aws iam list-attached-role-policies \
  --role-name DeveloperDNSRole \
  --profile sabpaisa_rnd \
  --query 'AttachedPolicies[?PolicyName==`DeveloperDNSPolicy`].PolicyName' \
  --output text)

if [ "$ATTACHED" = "DeveloperDNSPolicy" ]; then
  echo "✅ Setup verified successfully!"
else
  echo "❌ Setup verification failed"
  exit 1
fi

# Clean up temporary file
rm -f trust-policy.json

echo
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SETUP COMPLETE!                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "📌 IMPORTANT INFORMATION FOR DEVELOPERS:"
echo
echo "Role ARN: $ROLE_ARN"
echo "External ID: sabpaisa-dns-access"
echo "Hosted Zone: $HOSTED_ZONE_ID (rnd.sabpaisa.in)"
echo
echo "🔐 WHAT DEVELOPERS CAN DO:"
echo "  ✅ Create subdomains (e.g., admin.rnd.sabpaisa.in)"
echo "  ✅ Update their subdomain records"
echo "  ✅ List existing DNS records"
echo
echo "🚫 WHAT DEVELOPERS CANNOT DO:"
echo "  ❌ Delete any DNS records"
echo "  ❌ Modify the root domain (rnd.sabpaisa.in)"
echo "  ❌ Delete or modify the hosted zone"
echo "  ❌ Access other AWS services"
echo
echo "📝 NEXT STEPS:"
echo "1. Share the Role ARN with developers"
echo "2. Give them the 'create-subdomain.sh' script"
echo "3. They can now self-service create subdomains!"
echo
echo "💡 Security Note: All DNS changes are logged in CloudTrail"