#!/bin/bash

echo "🔍 Telescope Pre-Publish Check"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

errors=0
warnings=0

# 1. Check NPM login
echo -e "${BLUE}1. Checking NPM authentication...${NC}"
if npm whoami > /dev/null 2>&1; then
    USER=$(npm whoami)
    echo -e "${GREEN}✅ Logged in as: $USER${NC}"
else
    echo -e "${RED}❌ Not logged in to NPM${NC}"
    echo "   Run: npm login"
    errors=$((errors+1))
fi
echo ""

# 2. Check package name availability
echo -e "${BLUE}2. Checking package availability...${NC}"
PACKAGES=(
    "@ruijadom/telescope-core"
    "@ruijadom/telescope-browser"
    "@ruijadom/telescope-cursor"
    "@ruijadom/telescope-vite"
    "@ruijadom/telescope-webpack"
    "@ruijadom/telescope-cli"
    "@ruijadom/telescope"
)

for pkg in "${PACKAGES[@]}"; do
    if npm view "$pkg" version > /dev/null 2>&1; then
        VERSION=$(npm view "$pkg" version)
        echo -e "${YELLOW}⚠️  $pkg already exists (v$VERSION)${NC}"
        warnings=$((warnings+1))
    else
        echo -e "${GREEN}✅ $pkg available${NC}"
    fi
done
echo ""

# 3. Check build
echo -e "${BLUE}3. Checking build...${NC}"
if [ -d "packages/core/dist" ] && [ -d "packages/browser-runtime/dist" ]; then
    echo -e "${GREEN}✅ Packages built${NC}"
else
    echo -e "${RED}❌ Build not found${NC}"
    echo "   Run: npm run build"
    errors=$((errors+1))
fi
echo ""

# 4. Check package.json files
echo -e "${BLUE}4. Checking package.json files...${NC}"
for pkg_json in packages/*/package.json; do
    PKG_NAME=$(grep '"name"' "$pkg_json" | head -1 | cut -d'"' -f4)
    
    # Check for @ruijadom scope
    if ! echo "$PKG_NAME" | grep -q "@ruijadom"; then
        echo -e "${RED}❌ $pkg_json doesn't use @ruijadom scope${NC}"
        errors=$((errors+1))
    fi
    
    # Check for author
    if ! grep -q '"author"' "$pkg_json"; then
        echo -e "${YELLOW}⚠️  $pkg_json missing author${NC}"
        warnings=$((warnings+1))
    fi
    
    # Check for license
    if ! grep -q '"license"' "$pkg_json"; then
        echo -e "${YELLOW}⚠️  $pkg_json missing license${NC}"
        warnings=$((warnings+1))
    fi
done
echo -e "${GREEN}✅ All package.json files checked${NC}"
echo ""

# 5. Check READMEs
echo -e "${BLUE}5. Checking READMEs...${NC}"
for pkg_dir in packages/*; do
    if [ ! -f "$pkg_dir/README.md" ]; then
        echo -e "${YELLOW}⚠️  $pkg_dir missing README.md${NC}"
        warnings=$((warnings+1))
    fi
done
echo -e "${GREEN}✅ READMEs checked${NC}"
echo ""

# 6. Check for old references
echo -e "${BLUE}6. Checking for old references...${NC}"
if grep -r "react-hubble\|@react-hubble" packages/*/package.json > /dev/null 2>&1; then
    echo -e "${RED}❌ Found references to react-hubble${NC}"
    errors=$((errors+1))
else
    echo -e "${GREEN}✅ No old references${NC}"
fi
echo ""

# 7. Check tests
echo -e "${BLUE}7. Checking tests...${NC}"
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    warnings=$((warnings+1))
fi
echo ""

# Final result
echo "=========================================="
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}🎉 READY TO PUBLISH!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. npm run changeset"
    echo "  2. npm run version"
    echo "  3. git add . && git commit -m 'chore: prepare for release'"
    echo "  4. npm run release"
    echo "  5. git push --tags"
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings warning(s) - can publish but review first${NC}"
else
    echo -e "${RED}❌ $errors error(s) - fix before publishing${NC}"
    exit 1
fi
echo "=========================================="
