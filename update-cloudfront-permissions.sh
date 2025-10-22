#!/bin/bash

# 🔧 Script to Update Developer IAM Policy for CloudFront Access
# This adds CloudFront, ACM, and Route53 permissions to the DeveloperAccess policy

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🔐 UPDATING IAM POLICY FOR CLOUDFRONT ACCESS         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Check current user
echo "🔍 Checking current AWS identity..."
aws sts get-caller-identity --profile chaitanya-rnd

echo
echo "⚠️  This script will update the DeveloperAccess policy to include:"
echo "   • CloudFront (CDN) permissions"
echo "   • ACM (SSL Certificate) permissions"
echo "   • Route53 (DNS) permissions"
echo
echo "👤 WHO SHOULD RUN THIS:"
echo "   Someone with IAM admin access (sabpaisa-rnd profile or AWS Console admin)"
echo

read -p "Do you want to proceed? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Try to update with current profile first
echo "🔧 Attempting to update policy with current profile..."
aws iam create-policy-version \
  --policy-arn "arn:aws:iam::408876511992:policy/DeveloperAccess" \
  --policy-document file://cloudfront-policy-update.json \
  --set-as-default \
  --profile chaitanya-rnd 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Policy updated successfully!"
    echo "🎉 CloudFront permissions granted!"
else
    echo "❌ Current user doesn't have permission to update IAM policies"
    echo
    echo "📋 MANUAL STEPS REQUIRED:"
    echo "════════════════════════════════════════════════════════"
    echo
    echo "Option 1: Ask Admin to Run This Command"
    echo "─────────────────────────────────────────"
    echo "Ask someone with admin access to run:"
    echo
    echo "aws iam create-policy-version \\"
    echo "  --policy-arn \"arn:aws:iam::408876511992:policy/DeveloperAccess\" \\"
    echo "  --policy-document file://cloudfront-policy-update.json \\"
    echo "  --set-as-default \\"
    echo "  --profile sabpaisa-rnd"
    echo
    echo "Option 2: Update via AWS Console"
    echo "─────────────────────────────────────────"
    echo "1. Login to AWS Console as admin"
    echo "2. Go to IAM → Policies"
    echo "3. Search for 'DeveloperAccess'"
    echo "4. Click on the policy"
    echo "5. Edit policy → JSON"
    echo "6. Replace with content from cloudfront-policy-update.json"
    echo "7. Review and Save"
    echo
    echo "Option 3: Contact Admin"
    echo "─────────────────────────────────────────"
    echo "Send this message to abhimanyu.jha@sabpaisa.in:"
    echo
    echo "Subject: Need CloudFront Permissions for Account 408876511992"
    echo "Body: Please add cloudfront:*, acm:*, and route53:* permissions"
    echo "      to the DeveloperAccess policy in account 408876511992"
    echo "      for HTTPS deployment support."
    echo
fi

echo
echo "📝 Policy file saved as: cloudfront-policy-update.json"
echo "🔍 Once updated, test with:"
echo "   aws cloudfront list-distributions --profile chaitanya-rnd"
echo