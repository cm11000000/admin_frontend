#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔐 UPDATING CLOUDFRONT PERMISSIONS FOR ACCOUNT 408876511992║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Step 1: Assume role to get temporary credentials
echo "🔄 Assuming role in account 408876511992..."
TEMP_CREDS=$(aws sts assume-role \
  --role-arn "arn:aws:iam::408876511992:role/OrganizationAccountAccessRole" \
  --role-session-name "CloudFrontPolicyUpdate" \
  --profile sabpaisa_rnd \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text)

if [ $? -ne 0 ]; then
    echo "❌ Failed to assume role"
    exit 1
fi

ACCESS_KEY=$(echo "$TEMP_CREDS" | cut -f1)
SECRET_KEY=$(echo "$TEMP_CREDS" | cut -f2)
SESSION_TOKEN=$(echo "$TEMP_CREDS" | cut -f3)

# Step 2: Configure temporary profile
echo "⚙️  Setting up temporary profile..."
aws configure set aws_access_key_id "$ACCESS_KEY" --profile temp-cloudfront-update
aws configure set aws_secret_access_key "$SECRET_KEY" --profile temp-cloudfront-update
aws configure set aws_session_token "$SESSION_TOKEN" --profile temp-cloudfront-update
aws configure set region ap-south-1 --profile temp-cloudfront-update

# Step 3: Update the policy
echo "📝 Updating DeveloperAccess policy..."
aws iam create-policy-version \
  --policy-arn "arn:aws:iam::408876511992:policy/DeveloperAccess" \
  --policy-document file://cloudfront-policy-update.json \
  --set-as-default \
  --profile temp-cloudfront-update

if [ $? -eq 0 ]; then
    echo "✅ Policy updated successfully!"
    echo
    echo "🎉 CloudFront permissions have been added to account 408876511992"
    echo
    echo "📋 Added permissions:"
    echo "   • cloudfront:* - CloudFront CDN operations"
    echo "   • acm:* - SSL certificate management"
    echo "   • route53:* - DNS management"
    echo
    echo "🧪 Test the new permissions with:"
    echo "   aws cloudfront list-distributions --profile chaitanya-rnd"
else
    echo "❌ Failed to update policy"
    exit 1
fi

# Clean up temporary profile
rm -f ~/.aws/credentials.temp-cloudfront-update 2>/dev/null || true
echo "🧹 Cleaned up temporary profile"
echo
echo "✅ Done!"