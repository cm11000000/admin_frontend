#!/bin/bash

# Subdomain Delegation Workaround
# This creates a hosted zone in YOUR account that can be delegated from the master

SUBDOMAIN="admin.rnd.sabpaisa.in"
CLOUDFRONT_DOMAIN="d3ltikj36wzl4t.cloudfront.net"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║    🔧 SUBDOMAIN DELEGATION WORKAROUND                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

echo "This workaround creates a hosted zone in YOUR account that the"
echo "master account can delegate to, giving you full control."
echo

# Step 1: Create hosted zone in developer account
echo "📝 Step 1: Creating hosted zone for $SUBDOMAIN in your account..."

HOSTED_ZONE_OUTPUT=$(aws route53 create-hosted-zone \
  --name "$SUBDOMAIN" \
  --caller-reference "admin-$(date +%s)" \
  --profile chaitanya-rnd \
  --output json 2>&1)

if [ $? -eq 0 ]; then
  ZONE_ID=$(echo "$HOSTED_ZONE_OUTPUT" | jq -r '.HostedZone.Id' | cut -d'/' -f3)
  echo "✅ Hosted zone created successfully!"
  echo "   Zone ID: $ZONE_ID"

  # Get name servers
  NAME_SERVERS=$(echo "$HOSTED_ZONE_OUTPUT" | jq -r '.DelegationSet.NameServers[]')

  echo
  echo "📌 Name servers for your zone:"
  echo "$NAME_SERVERS" | while read ns; do
    echo "   • $ns"
  done

  # Step 2: Create CNAME record in your zone
  echo
  echo "📝 Step 2: Creating CNAME record in your hosted zone..."

  cat > route53-change.json << EOF
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

  CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch file://route53-change.json \
    --profile chaitanya-rnd \
    --query 'ChangeInfo.Id' \
    --output text)

  if [ $? -eq 0 ]; then
    echo "✅ CNAME record created in your zone!"
    echo "   Change ID: $CHANGE_ID"
  else
    echo "❌ Failed to create CNAME record"
  fi

  # Step 3: Generate delegation request
  echo
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║         📧 SEND THIS TO YOUR ADMIN                            ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo
  echo "Subject: Need NS Records for Admin Portal Subdomain"
  echo
  echo "Hi,"
  echo
  echo "I've created a hosted zone for the admin portal subdomain in my"
  echo "developer account. Please create NS records to delegate control"
  echo "of 'admin.rnd.sabpaisa.in' to my hosted zone."
  echo
  echo "In Route53 Hosted Zone ID: Z06541923RERTQXE41XSI"
  echo "Please create these NS records:"
  echo
  echo "Record Name: admin"
  echo "Record Type: NS"
  echo "TTL: 300"
  echo "Values:"
  echo "$NAME_SERVERS" | while read ns; do
    echo "  $ns"
  done
  echo
  echo "This will delegate the 'admin' subdomain to my account, allowing"
  echo "me to manage DNS records for admin.rnd.sabpaisa.in independently."
  echo
  echo "Thanks!"
  echo
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║         ✅ WHAT HAPPENS AFTER DELEGATION                      ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo
  echo "Once the admin creates the NS records:"
  echo "1. You'll have FULL control of admin.rnd.sabpaisa.in"
  echo "2. You can create/modify any DNS records for this subdomain"
  echo "3. The site will be accessible at: http://admin.rnd.sabpaisa.in"
  echo "4. You can add more records (A, CNAME, TXT, etc.) as needed"
  echo
  echo "📝 Your hosted zone ID: $ZONE_ID"
  echo "   Save this for future DNS management!"

else
  # Check if zone already exists
  if echo "$HOSTED_ZONE_OUTPUT" | grep -q "HostedZoneAlreadyExists"; then
    echo "⚠️  Hosted zone for $SUBDOMAIN already exists!"
    echo
    echo "Let me find the existing zone..."

    EXISTING_ZONE=$(aws route53 list-hosted-zones-by-name \
      --query "HostedZones[?Name=='${SUBDOMAIN}.'].Id" \
      --profile chaitanya-rnd \
      --output text | cut -d'/' -f3)

    if [ -n "$EXISTING_ZONE" ]; then
      echo "📌 Found existing zone: $EXISTING_ZONE"
      echo
      echo "Getting name servers..."

      NAME_SERVERS=$(aws route53 get-hosted-zone \
        --id "$EXISTING_ZONE" \
        --profile chaitanya-rnd \
        --query 'DelegationSet.NameServers[]' \
        --output text)

      echo "📧 Send these name servers to your admin:"
      echo "$NAME_SERVERS" | tr '\t' '\n' | while read ns; do
        echo "   • $ns"
      done
    fi
  else
    echo "❌ Failed to create hosted zone"
    echo "$HOSTED_ZONE_OUTPUT"
  fi
fi

# Clean up
rm -f route53-change.json

echo
echo "💡 Alternative: If delegation doesn't work, use the direct URL:"
echo "   https://d3ltikj36wzl4t.cloudfront.net"