#!/bin/bash

# Team Vacation Calendar - One-Click AWS Deployment Script
# This script deploys the application to AWS using S3 + CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists npm; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

if ! command_exists aws; then
    print_error "AWS CLI is not installed. Please install AWS CLI first."
    print_status "Install instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

print_success "Prerequisites check passed!"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Install AWS CDK globally if not present
if ! command_exists cdk; then
    print_status "Installing AWS CDK globally..."
    npm install -g aws-cdk
fi

# Bootstrap CDK (if needed)
print_status "Bootstrapping AWS CDK..."
cdk bootstrap 2>/dev/null || print_warning "CDK bootstrap may have already been run"

# Build the application
print_status "Building the application..."
npm run build

# Deploy to AWS
print_status "Deploying to AWS..."
npm run cdk:deploy

print_success "Deployment completed!"
print_status "Your Team Vacation Calendar is now deployed to AWS!"
print_status "Check the CloudFormation outputs for the website URL."

# Get the deployed URL
print_status "Retrieving deployment information..."
STACK_NAME="TeamVacationCalendarStack"
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text 2>/dev/null || echo "")

if [ -n "$WEBSITE_URL" ]; then
    print_success "Your application is available at: $WEBSITE_URL"
else
    print_warning "Could not retrieve website URL. Check AWS CloudFormation console for outputs."
fi

print_status "Deployment script completed!"