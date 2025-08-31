#!/bin/bash

# Simple AWS S3 + CloudFront Deployment Script
# This script deploys the vacation calendar directly using AWS CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate unique bucket name
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")
BUCKET_NAME="team-vacation-calendar-${ACCOUNT_ID}-${REGION}"

print_status "Starting simple AWS deployment..."
print_status "Account ID: ${ACCOUNT_ID}"
print_status "Region: ${REGION}"
print_status "Bucket: ${BUCKET_NAME}"

# Build the application
print_status "Building the application..."
npm run build

# Create S3 bucket
print_status "Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || print_status "Bucket already exists"

# Configure bucket for static website hosting
print_status "Configuring bucket for static website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload files
print_status "Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Set bucket policy for public read access
print_status "Setting bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Get website URL
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

print_success "Deployment completed!"
print_success "Your Team Vacation Calendar is available at:"
print_success "$WEBSITE_URL"

print_status "Note: This is a basic S3 static website. For production use with HTTPS,"
print_status "consider setting up CloudFront distribution manually or using CDK later."

# Save deployment info
echo "Deployment completed at: $(date)" > deployment-info.txt
echo "Website URL: $WEBSITE_URL" >> deployment-info.txt
echo "Bucket: $BUCKET_NAME" >> deployment-info.txt
echo "Region: $REGION" >> deployment-info.txt

print_status "Deployment information saved to deployment-info.txt"