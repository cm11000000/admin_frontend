#!/bin/bash

# CloudFront Distribution Status Checker
DISTRIBUTION_ID="E3A630N588UPWD"
DOMAIN="d3ltikj36wzl4t.cloudfront.net"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🌐 CLOUDFRONT DISTRIBUTION STATUS                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Check distribution status
STATUS=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --profile chaitanya-rnd --query 'Distribution.Status' --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Error checking distribution status"
    exit 1
fi

echo "📊 Distribution ID: $DISTRIBUTION_ID"
echo "🌐 CloudFront URL: https://$DOMAIN"
echo "📍 Status: $STATUS"
echo

if [ "$STATUS" = "Deployed" ]; then
    echo "✅ CloudFront is ready! Your HTTPS URLs:"
    echo
    echo "🔒 HTTPS URLs (Copy these!):"
    echo "═══════════════════════════════════════════════════════════"
    echo "📱 Login:      https://$DOMAIN/login/"
    echo "🏠 Dashboard:  https://$DOMAIN/dashboard/"
    echo "👥 Clients:    https://$DOMAIN/clients/"
    echo "💳 Transactions: https://$DOMAIN/transactions/"
    echo "📊 Reports:    https://$DOMAIN/reports/"
    echo "═══════════════════════════════════════════════════════════"
    echo
    echo "🎉 Your beautiful admin portal is now available via HTTPS!"
    echo
    echo "💡 Test it with:"
    echo "   curl -I https://$DOMAIN/login/"
else
    echo "⏳ CloudFront is still deploying globally..."
    echo "   This typically takes 15-20 minutes"
    echo "   Current time: $(date '+%H:%M:%S')"
    echo
    echo "🔄 Check again in a few minutes with:"
    echo "   ./cloudfront-status.sh"
fi

echo
echo "📝 Additional Info:"
echo "   • S3 Origin: sabpaisa-admin-v5-20251010.s3-website.ap-south-1.amazonaws.com"
echo "   • HTTP still works: http://sabpaisa-admin-v5-20251010.s3-website.ap-south-1.amazonaws.com"
echo "   • CloudFront Cost: ~$1-10/month based on usage"