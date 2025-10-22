#!/bin/bash

# Setup Local Domain Script for admin.sabpaisa.in
# This script adds admin.sabpaisa.in to your /etc/hosts file

echo "🔧 Setting up local domain: admin.sabpaisa.in"
echo "================================================"
echo ""

# Check if entry already exists
if grep -q "admin.sabpaisa.in" /etc/hosts; then
    echo "✅ Entry already exists in /etc/hosts"
    grep "admin.sabpaisa.in" /etc/hosts
    echo ""
    echo "No changes needed!"
else
    echo "⚠️  Adding entry to /etc/hosts..."
    echo "This requires administrator privileges (sudo)"
    echo ""

    # Add the entry
    echo "127.0.0.1 admin.sabpaisa.in" | sudo tee -a /etc/hosts > /dev/null

    if [ $? -eq 0 ]; then
        echo "✅ Successfully added entry to /etc/hosts"
        echo ""
        echo "Entry added:"
        grep "admin.sabpaisa.in" /etc/hosts
    else
        echo "❌ Failed to add entry. Please add manually:"
        echo ""
        echo "   sudo nano /etc/hosts"
        echo "   Add this line: 127.0.0.1 admin.sabpaisa.in"
        exit 1
    fi
fi

echo ""
echo "🧹 Flushing DNS cache..."

# Detect OS and flush DNS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sudo dscacheutil -flushcache
    sudo killall -HUP mDNSResponder
    echo "✅ DNS cache flushed (macOS)"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if systemctl is-active --quiet systemd-resolved; then
        sudo systemctl restart systemd-resolved
        echo "✅ DNS cache flushed (Linux - systemd-resolved)"
    elif [ -f /etc/init.d/nscd ]; then
        sudo /etc/init.d/nscd restart
        echo "✅ DNS cache flushed (Linux - nscd)"
    else
        echo "⚠️  Could not detect DNS cache service"
    fi
else
    echo "⚠️  Unknown OS, please flush DNS cache manually"
fi

echo ""
echo "🧪 Testing DNS resolution..."
if ping -c 1 admin.sabpaisa.in > /dev/null 2>&1; then
    echo "✅ admin.sabpaisa.in resolves to localhost"
else
    echo "⚠️  DNS test failed, but entry was added. Try restarting your browser."
fi

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo ""
echo "You can now access the application at:"
echo "   🌐 http://admin.sabpaisa.in:3002"
echo ""
echo "Make sure the dev server is running:"
echo "   npm run dev"
echo ""
echo "To revert changes, run:"
echo "   sudo sed -i '' '/admin.sabpaisa.in/d' /etc/hosts"
echo "================================================"
