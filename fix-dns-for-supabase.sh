#!/bin/bash

# 🔧 Fix DNS for Supabase - One-Click Solution
# This script switches your DNS from ISP (broken) to Google DNS (working)

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 SUPABASE DNS FIX SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect active network interface
echo "🔍 Step 1: Detecting active network interface..."
ACTIVE_INTERFACE=$(route -n get default 2>&1 | grep interface | awk '{print $2}')

if [ -z "$ACTIVE_INTERFACE" ]; then
    echo "❌ Could not detect active network interface"
    exit 1
fi

echo "✅ Found active interface: $ACTIVE_INTERFACE"
echo ""

# Get network service name for the interface
echo "🔍 Step 2: Finding network service name..."
if [ "$ACTIVE_INTERFACE" = "en0" ]; then
    NETWORK_SERVICE="Wi-Fi"
elif [ "$ACTIVE_INTERFACE" = "en1" ]; then
    NETWORK_SERVICE="USB 10/100/1000 LAN"
else
    NETWORK_SERVICE="Wi-Fi"  # Default fallback
fi

echo "✅ Using network service: $NETWORK_SERVICE"
echo ""

# Show current DNS
echo "📋 Step 3: Current DNS configuration..."
echo "Current DNS servers:"
scutil --dns | grep 'nameserver\[0\]' | head -2
echo ""

# Test current DNS
echo "🧪 Step 4: Testing current DNS with Supabase..."
if nslookup axlruvvsjepsulcbqlho.supabase.co >/dev/null 2>&1; then
    echo "✅ Current DNS can already resolve Supabase!"
    echo "   No changes needed. Your DNS is working fine."
    echo ""
    exit 0
else
    echo "❌ Current DNS CANNOT resolve Supabase (this is the problem)"
    echo ""
fi

# Prompt for DNS choice
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Choose DNS provider:"
echo "  1) Google DNS (8.8.8.8, 8.8.4.4) - Recommended"
echo "  2) Cloudflare DNS (1.1.1.1, 1.0.0.1) - Privacy focused"
echo "  3) Cancel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        DNS_PRIMARY="8.8.8.8"
        DNS_SECONDARY="8.8.4.4"
        DNS_NAME="Google DNS"
        ;;
    2)
        DNS_PRIMARY="1.1.1.1"
        DNS_SECONDARY="1.0.0.1"
        DNS_NAME="Cloudflare DNS"
        ;;
    3)
        echo "❌ Cancelled by user"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔧 Step 5: Switching to $DNS_NAME..."
echo "   This requires admin password..."
echo ""

# Change DNS
if sudo networksetup -setdnsservers "$NETWORK_SERVICE" "$DNS_PRIMARY" "$DNS_SECONDARY"; then
    echo "✅ DNS servers updated successfully!"
else
    echo "❌ Failed to update DNS servers"
    echo "   Try manually: System Settings > Network > DNS"
    exit 1
fi

echo ""
echo "⏳ Step 6: Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder 2>/dev/null || true
echo "✅ DNS cache flushed"

echo ""
echo "📋 Step 7: Verifying new DNS configuration..."
echo "New DNS servers:"
scutil --dns | grep 'nameserver\[0\]' | head -2
echo ""

echo "🧪 Step 8: Testing Supabase resolution..."
if nslookup axlruvvsjepsulcbqlho.supabase.co >/dev/null 2>&1; then
    echo "✅ SUCCESS! Supabase domain now resolves!"
    echo ""
    RESOLVED_IP=$(nslookup axlruvvsjepsulcbqlho.supabase.co | grep 'Address:' | tail -1 | awk '{print $2}')
    echo "   Resolved to: $RESOLVED_IP"
else
    echo "❌ Still cannot resolve Supabase"
    echo "   Wait 30 seconds and try again, or restart your Mac"
    exit 1
fi

echo ""
echo "🧪 Step 9: Testing actual connection to Supabase..."
if curl -s --connect-timeout 5 "https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/" -o /dev/null; then
    echo "✅ SUCCESS! Can now connect to Supabase API!"
else
    echo "⚠️  DNS works but connection still fails"
    echo "   This might resolve after a few seconds"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DNS FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Test Node.js Supabase connection:"
echo "     node test-bubaque-query.js"
echo ""
echo "  2. If you want to revert to ISP DNS later:"
echo "     sudo networksetup -setdnsservers $NETWORK_SERVICE Empty"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
