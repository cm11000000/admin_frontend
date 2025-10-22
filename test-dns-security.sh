#!/bin/bash

# Security Test Script for Developer DNS Access
# This script verifies that the security restrictions are working properly

# Configuration
MASTER_ACCOUNT="070658298707"
HOSTED_ZONE_ID="Z06541923RERTQXE41XSI"
ROLE_ARN="arn:aws:iam::$MASTER_ACCOUNT:role/DeveloperDNSRole"
EXTERNAL_ID="sabpaisa-dns-access"
TEST_SUBDOMAIN="security-test-$(date +%s)"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        🔒 TESTING DNS SECURITY RESTRICTIONS                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "This script will verify that developers:"
echo "  ✅ CAN create subdomains"
echo "  ❌ CANNOT delete records"
echo "  ❌ CANNOT modify root domain"
echo "  ❌ CANNOT access other AWS services"
echo

# Step 1: Assume role
echo "🔑 Assuming developer role..."

TEMP_CREDS=$(aws sts assume-role \
  --role-arn "$ROLE_ARN" \
  --role-session-name "SecurityTest" \
  --external-id "$EXTERNAL_ID" \
  --profile chaitanya-rnd \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Failed to assume role. Setup might not be complete."
  exit 1
fi

# Parse credentials
ACCESS_KEY=$(echo "$TEMP_CREDS" | cut -f1)
SECRET_KEY=$(echo "$TEMP_CREDS" | cut -f2)
SESSION_TOKEN=$(echo "$TEMP_CREDS" | cut -f3)

# Configure temporary profile
aws configure set aws_access_key_id "$ACCESS_KEY" --profile test-dns
aws configure set aws_secret_access_key "$SECRET_KEY" --profile test-dns
aws configure set aws_session_token "$SESSION_TOKEN" --profile test-dns
aws configure set region ap-south-1 --profile test-dns

echo "✅ Role assumed successfully"
echo

# Test 1: Can list DNS records (READ-ONLY)
echo "📋 Test 1: Listing DNS records (should succeed)..."
aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --profile test-dns \
  --max-items 1 > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ PASS: Can list DNS records"
else
  echo "❌ FAIL: Cannot list DNS records"
fi

# Test 2: Can create subdomain
echo
echo "📋 Test 2: Creating test subdomain (should succeed)..."

cat > test-create.json << EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "$TEST_SUBDOMAIN.rnd.sabpaisa.in",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "test.example.com"}]
    }
  }]
}
EOF

CREATE_RESULT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://test-create.json \
  --profile test-dns 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ PASS: Can create subdomain"
  CHANGE_ID=$(echo "$CREATE_RESULT" | grep -o '"Id":"[^"]*' | cut -d'"' -f4)
else
  echo "❌ FAIL: Cannot create subdomain"
  echo "   Error: $CREATE_RESULT"
fi

# Test 3: Cannot delete records
echo
echo "📋 Test 3: Attempting to delete record (should fail)..."

cat > test-delete.json << EOF
{
  "Changes": [{
    "Action": "DELETE",
    "ResourceRecordSet": {
      "Name": "$TEST_SUBDOMAIN.rnd.sabpaisa.in",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "test.example.com"}]
    }
  }]
}
EOF

DELETE_RESULT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://test-delete.json \
  --profile test-dns 2>&1)

if [ $? -ne 0 ] && echo "$DELETE_RESULT" | grep -q "AccessDenied"; then
  echo "✅ PASS: Cannot delete records (Access Denied)"
else
  echo "❌ FAIL: Delete operation not properly restricted"
  echo "   Result: $DELETE_RESULT"
fi

# Test 4: Cannot modify root domain
echo
echo "📋 Test 4: Attempting to modify root domain (should fail)..."

cat > test-root.json << EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "rnd.sabpaisa.in",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "1.2.3.4"}]
    }
  }]
}
EOF

ROOT_RESULT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://test-root.json \
  --profile test-dns 2>&1)

if [ $? -ne 0 ] && echo "$ROOT_RESULT" | grep -q "AccessDenied"; then
  echo "✅ PASS: Cannot modify root domain (Access Denied)"
else
  echo "❌ FAIL: Root domain modification not properly restricted"
  echo "   Result: $ROOT_RESULT"
fi

# Test 5: Cannot access S3
echo
echo "📋 Test 5: Attempting to list S3 buckets (should fail)..."

S3_RESULT=$(aws s3 ls --profile test-dns 2>&1)

if [ $? -ne 0 ] && echo "$S3_RESULT" | grep -q "AccessDenied"; then
  echo "✅ PASS: Cannot access S3 (Access Denied)"
else
  echo "❌ FAIL: S3 access not properly restricted"
fi

# Test 6: Cannot access EC2
echo
echo "📋 Test 6: Attempting to describe EC2 instances (should fail)..."

EC2_RESULT=$(aws ec2 describe-instances --profile test-dns 2>&1)

if [ $? -ne 0 ] && echo "$EC2_RESULT" | grep -q "UnauthorizedOperation"; then
  echo "✅ PASS: Cannot access EC2 (Unauthorized)"
else
  echo "❌ FAIL: EC2 access not properly restricted"
fi

# Test 7: Cannot delete the hosted zone
echo
echo "📋 Test 7: Attempting to delete hosted zone (should fail)..."

ZONE_DELETE=$(aws route53 delete-hosted-zone \
  --id "$HOSTED_ZONE_ID" \
  --profile test-dns 2>&1)

if [ $? -ne 0 ] && echo "$ZONE_DELETE" | grep -q "AccessDenied"; then
  echo "✅ PASS: Cannot delete hosted zone (Access Denied)"
else
  echo "❌ FAIL: Zone deletion not properly restricted"
fi

# Cleanup: Try to clean up test subdomain (using UPSERT with minimal TTL)
echo
echo "🧹 Cleaning up test record..."

# Note: We can't DELETE, but admin can clean up later
cat > test-cleanup.json << EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "$TEST_SUBDOMAIN.rnd.sabpaisa.in",
      "Type": "CNAME",
      "TTL": 60,
      "ResourceRecords": [{"Value": "cleanup.pending"}]
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://test-cleanup.json \
  --profile test-dns > /dev/null 2>&1

# Clean up temporary files and credentials
rm -f test-*.json
aws configure --profile test-dns set aws_access_key_id ""
aws configure --profile test-dns set aws_secret_access_key ""
aws configure --profile test-dns set aws_session_token ""

echo
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                  📊 SECURITY TEST RESULTS                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo
echo "The security restrictions are working correctly if all tests passed."
echo
echo "📝 Note: Test subdomain '$TEST_SUBDOMAIN.rnd.sabpaisa.in' was created"
echo "   but cannot be deleted by developers (as intended)."
echo "   Admin can clean it up if needed."