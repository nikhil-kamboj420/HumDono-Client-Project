#!/bin/bash

# HumDono Production Setup Script
echo "🚀 Setting up HumDono for Production Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
echo -e "${YELLOW}Checking environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your production credentials${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend/.env from example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please update frontend/.env with your production API URL${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend && npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ..
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend && npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

# Build frontend
echo -e "${YELLOW}Building frontend for production...${NC}"
cd frontend && npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update backend/.env with production credentials"
echo "2. Update frontend/.env with production API URL"
echo "3. Push to GitHub"
echo "4. Deploy on Railway"
echo ""
echo "See RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions"
