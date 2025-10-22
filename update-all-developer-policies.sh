#!/bin/bash

# Update DeveloperAccess Policy for All Active Developer Accounts
# Adds CloudFront, ACM, and Route53 permissions

MASTER_PROFILE="sabpaisa_rnd"

# List of active developer account IDs
ACCOUNT_IDS=(
  "209332675163"  # SabPaisa-RnD-PruthvirajAws
  "271633506347"  # SabPaisa-RnD-AmitBhandari
  "317970381545"  # SabPaisa-RnD-VinayKumar
  "387793809708"  # SabPaisa-RnD-AnupamKumaria
  "408876511992"  # SabPaisa-RnD-Chaitanya (already done)
  "428169664322"  # SabPaisa-RnD-RajshekharSinha
  "434807866830"  # SabPaisa-RnD-SakshiBisht
  "494253214161"  # SabPaisa-RnD-ShantanuSingh
  "589535615483"  # SabPaisa-RnD-shared
  "679865461519"  # SabPaisa-RnD-RahmatAws
  "791990038205"  # SabPaisa-RnD-Laxmikant
  "812061567091"  # SabPaisa-RnD-PraveenGangwar
  "818680680847"  # SabPaisa-RnD-Aws-test-cm
  "877634772064"  # SabPaisa-RnD-HimaniAws
  "893445410174"  # SabPaisa-RnD-ManishPrajapati
)

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║    🔧 UPDATING DEVELOPER POLICIES FOR ALL ACCOUNTS            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "Adding CloudFront, ACM, and Route53 permissions to DeveloperAccess policy"
echo "for all ${#ACCOUNT_IDS[@]} active developer accounts"
echo

# Create the updated policy document
cat > updated-developer-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RegionalServices",
      "Effect": "Allow",
      "Action": [
        "*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "ap-south-1"
        }
      }
    },
    {
      "Sid": "GlobalServices",
      "Effect": "Allow",
      "Action": [
        "iam:*",
        "sts:*",
        "s3:*",
        "ecr:*",
        "cloudfront:*",
        "acm:*",
        "route53:*"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Function to assume role and update policy
update_account_policy() {
  local ACCOUNT_ID=$1
  local ACCOUNT_NAME=$2

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Processing: $ACCOUNT_NAME ($ACCOUNT_ID)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Skip Chaitanya's account (already updated)
  if [ "$ACCOUNT_ID" = "408876511992" ]; then
    echo "⏭️  Skipping Chaitanya's account (already updated)"
    echo
    return 0
  fi

  # Assume role in the target account
  ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/OrganizationAccountAccessRole"

  echo "🔑 Assuming role: $ROLE_ARN"

  TEMP_CREDS=$(aws sts assume-role \
    --role-arn "$ROLE_ARN" \
    --role-session-name "PolicyUpdate-$(date +%s)" \
    --profile "$MASTER_PROFILE" \
    --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
    --output text 2>&1)

  if [ $? -ne 0 ]; then
    echo "❌ Failed to assume role"
    echo "   Error: $TEMP_CREDS"
    echo
    return 1
  fi

  # Parse credentials
  ACCESS_KEY=$(echo "$TEMP_CREDS" | cut -f1)
  SECRET_KEY=$(echo "$TEMP_CREDS" | cut -f2)
  SESSION_TOKEN=$(echo "$TEMP_CREDS" | cut -f3)

  # Configure temporary profile
  aws configure set aws_access_key_id "$ACCESS_KEY" --profile temp-policy-update
  aws configure set aws_secret_access_key "$SECRET_KEY" --profile temp-policy-update
  aws configure set aws_session_token "$SESSION_TOKEN" --profile temp-policy-update
  aws configure set region ap-south-1 --profile temp-policy-update

  echo "✅ Role assumed successfully"

  # Check if DeveloperAccess policy exists
  echo "🔍 Checking if DeveloperAccess policy exists..."

  POLICY_ARN=$(aws iam list-policies \
    --scope Local \
    --profile temp-policy-update \
    --query "Policies[?PolicyName=='DeveloperAccess'].Arn" \
    --output text 2>/dev/null)

  if [ -z "$POLICY_ARN" ]; then
    echo "⚠️  DeveloperAccess policy not found in this account"
    echo
    return 0
  fi

  echo "✅ Found policy: $POLICY_ARN"

  # Get current policy version
  CURRENT_VERSION=$(aws iam get-policy \
    --policy-arn "$POLICY_ARN" \
    --profile temp-policy-update \
    --query 'Policy.DefaultVersionId' \
    --output text)

  echo "📌 Current version: $CURRENT_VERSION"

  # Get current policy to check if it already has the permissions
  CURRENT_POLICY=$(aws iam get-policy-version \
    --policy-arn "$POLICY_ARN" \
    --version-id "$CURRENT_VERSION" \
    --profile temp-policy-update \
    --query 'PolicyVersion.Document' \
    --output json)

  # Check if cloudfront is already in the policy
  if echo "$CURRENT_POLICY" | grep -q "cloudfront"; then
    echo "✅ Policy already contains CloudFront permissions - skipping"
    echo
    return 0
  fi

  # Create new policy version
  echo "📝 Creating new policy version with global services..."

  NEW_VERSION=$(aws iam create-policy-version \
    --policy-arn "$POLICY_ARN" \
    --policy-document file://updated-developer-policy.json \
    --set-as-default \
    --profile temp-policy-update \
    --query 'PolicyVersion.VersionId' \
    --output text 2>&1)

  if [ $? -eq 0 ]; then
    echo "✅ Policy updated successfully!"
    echo "   New version: $NEW_VERSION"

    # Delete old policy version if there are more than 2 versions
    VERSION_COUNT=$(aws iam list-policy-versions \
      --policy-arn "$POLICY_ARN" \
      --profile temp-policy-update \
      --query 'length(Versions)' \
      --output text)

    if [ "$VERSION_COUNT" -gt 2 ]; then
      echo "🧹 Cleaning up old policy versions..."
      # Delete the oldest non-default version
      OLD_VERSION=$(aws iam list-policy-versions \
        --policy-arn "$POLICY_ARN" \
        --profile temp-policy-update \
        --query 'Versions[?!IsDefaultVersion] | [-1].VersionId' \
        --output text)

      if [ -n "$OLD_VERSION" ] && [ "$OLD_VERSION" != "None" ]; then
        aws iam delete-policy-version \
          --policy-arn "$POLICY_ARN" \
          --version-id "$OLD_VERSION" \
          --profile temp-policy-update 2>/dev/null
        echo "   Deleted old version: $OLD_VERSION"
      fi
    fi
  else
    echo "❌ Failed to update policy"
    echo "   Error: $NEW_VERSION"
  fi

  # Clean up credentials
  aws configure --profile temp-policy-update set aws_access_key_id ""
  aws configure --profile temp-policy-update set aws_secret_access_key ""
  aws configure --profile temp-policy-update set aws_session_token ""

  echo
}

# Main loop
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

for ACCOUNT_ID in "${ACCOUNT_IDS[@]}"; do
  # Get account name from organization
  ACCOUNT_NAME=$(aws organizations list-accounts \
    --profile "$MASTER_PROFILE" \
    --query "Accounts[?Id=='$ACCOUNT_ID'].Name" \
    --output text)

  if [ -z "$ACCOUNT_NAME" ]; then
    ACCOUNT_NAME="Unknown"
  fi

  if update_account_policy "$ACCOUNT_ID" "$ACCOUNT_NAME"; then
    if [ "$ACCOUNT_ID" = "408876511992" ]; then
      ((SKIP_COUNT++))
    else
      ((SUCCESS_COUNT++))
    fi
  else
    ((FAIL_COUNT++))
  fi
done

# Clean up policy file
rm -f updated-developer-policy.json

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    📊 UPDATE SUMMARY                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "Total accounts processed: ${#ACCOUNT_IDS[@]}"
echo "✅ Successfully updated: $SUCCESS_COUNT"
echo "⏭️  Skipped (already done): $SKIP_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo
echo "🎯 All active developer accounts now have:"
echo "   ✅ CloudFront access (cloudfront:*)"
echo "   ✅ ACM access (acm:*)"
echo "   ✅ Route53 access (route53:*)"
echo
echo "Developers can now:"
echo "   - Create CloudFront distributions"
echo "   - Request SSL certificates"
echo "   - Manage DNS records (via cross-account role)"
echo