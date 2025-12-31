#!/bin/bash

# QChannel Crypto Roku Sideloader
# Easily deploy your channel to Roku for testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 QChannel Crypto Roku Sideloader${NC}"
echo ""

# Check if we're in the roku directory or if manifest exists
if [ ! -f "manifest" ]; then
    echo -e "${RED}Error: manifest not found. Run this from the roku directory.${NC}"
    exit 1
fi

# Prompt for Roku IP if not provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Enter your Roku device IP address:${NC}"
    read -p "IP: " ROKU_IP
else
    ROKU_IP=$1
fi

# Validate IP format
if [[ ! $ROKU_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo -e "${RED}Error: Invalid IP address format${NC}"
    exit 1
fi

# Prompt for Roku developer credentials
echo ""
echo -e "${YELLOW}Enter your Roku developer credentials:${NC}"
echo "(Default is usually rokudev/rokudev)"
read -p "Username [rokudev]: " ROKU_USER
ROKU_USER=${ROKU_USER:-rokudev}
read -sp "Password [rokudev]: " ROKU_PASS
ROKU_PASS=${ROKU_PASS:-rokudev}
echo ""

echo ""
echo -e "${BLUE}📦 Packaging QChannel...${NC}"

# Create ZIP package directly from current directory
PACKAGE_NAME="qchannel-roku-$(date +%Y%m%d-%H%M%S).zip"
zip -r $PACKAGE_NAME . -x "*.DS_Store" -x "*.git*" -x "*.sh" -x "__MACOSX/*" > /dev/null

echo -e "${GREEN}✓ Package created: $PACKAGE_NAME${NC}"

# Check if Roku is reachable
echo ""
echo -e "${BLUE}🔍 Checking Roku connection...${NC}"
if ! ping -c 1 -W 2 $ROKU_IP > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot reach Roku at $ROKU_IP${NC}"
    echo -e "${YELLOW}Make sure your Roku is on the same network${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Roku is reachable${NC}"

# Delete existing channel
echo ""
echo -e "${BLUE}🗑️  Removing existing channel (if any)...${NC}"
curl -s --digest -u $ROKU_USER:$ROKU_PASS \
    -F "mysubmit=Delete" \
    -F "archive=" \
    http://$ROKU_IP/plugin_install \
    > /dev/null 2>&1 || true

# Upload new channel
echo -e "${BLUE}📤 Uploading QChannel to Roku...${NC}"
RESPONSE=$(curl -s --digest -u $ROKU_USER:$ROKU_PASS \
    -F "mysubmit=Install" \
    -F "archive=@$PACKAGE_NAME" \
    http://$ROKU_IP/plugin_install)

# Check if upload was successful
if echo "$RESPONSE" | grep -q "Install Success"; then
    echo -e "${GREEN}✓ QChannel installed successfully!${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 QChannel Crypto is now running!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "📺 Access your channel from the Roku home screen"
    echo -e "🔧 View logs at: http://$ROKU_IP:8080"
    echo -e "📊 Debug console: http://$ROKU_IP:8080/plugin_inspect"
    echo ""
    echo -e "${BLUE}Useful Roku Developer Links:${NC}"
    echo -e "  • Developer Settings: http://$ROKU_IP"
    echo -e "  • Screenshot Tool: http://$ROKU_IP:8080/screenshot"
    echo -e "  • Plugin Packager: http://$ROKU_IP/plugin_package"
elif echo "$RESPONSE" | grep -q "Identical to previous version"; then
    echo -e "${YELLOW}⚠ Channel is identical to previous version${NC}"
    echo -e "${YELLOW}Increment build_version in manifest to force update${NC}"
else
    echo -e "${RED}✗ Installation failed${NC}"
    echo "$RESPONSE" | grep -i error || echo "$RESPONSE"
    exit 1
fi

# Cleanup old packages
echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -f qchannel-roku-*.zip 2>/dev/null || true
echo -e "${GREEN}✓ Done!${NC}"
echo ""
echo -e "${YELLOW}Tip: Run with IP argument to skip prompts:${NC}"
echo -e "${YELLOW}  ./roku-sideload.sh 192.168.1.100${NC}"
