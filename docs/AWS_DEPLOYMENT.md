# AWS Deployment Guide

This guide explains how to deploy the Team Vacation Calendar to AWS using S3 + CloudFront.

## Architecture

The application is deployed as a static website using:
- **Amazon S3**: Hosts the static files (HTML, CSS, JS)
- **Amazon CloudFront**: Global CDN for fast content delivery
- **AWS CDK**: Infrastructure as Code for easy deployment

## Cost Estimation

This deployment is designed to be extremely cost-effective:

### S3 Costs
- Storage: ~$0.023/GB/month (first 50 TB)
- Requests: ~$0.0004/1000 GET requests
- **Estimated monthly cost for small team**: < $1

### CloudFront Costs
- Data transfer: ~$0.085/GB for first 10 TB
- Requests: ~$0.0075/10,000 HTTPS requests
- **Estimated monthly cost for small team**: < $5

### Total Estimated Cost: < $6/month

## Prerequisites

1. **AWS Account**: Sign up at https://aws.amazon.com
2. **AWS CLI**: Install from https://aws.amazon.com/cli/
3. **Node.js**: Version 18+ from https://nodejs.org/
4. **Git**: For version control

## One-Click Deployment

### Option 1: Automated Script (Recommended)

```bash
# Clone and enter the project
git clone <your-repo-url>
cd team-vacation-calendar

# Run the one-click deployment script
./deploy.sh
```

The script will:
1. Check prerequisites
2. Install dependencies
3. Build the application
4. Deploy to AWS
5. Provide the website URL

### Option 2: Manual Deployment

```bash
# Install dependencies
npm install

# Configure AWS credentials (if not done)
aws configure

# Install AWS CDK globally
npm install -g aws-cdk

# Bootstrap CDK (one-time setup)
cdk bootstrap

# Build and deploy
npm run deploy
```

## Configuration

### AWS Region
The application deploys to your default AWS region. To change:

```bash
# Set default region
aws configure set region us-east-1

# Or export for current session
export AWS_DEFAULT_REGION=us-east-1
```

### Custom Domain (Optional)
To use a custom domain:

1. Purchase domain in Route 53 or transfer existing domain
2. Modify `infrastructure/team-vacation-calendar-stack.ts`
3. Add certificate and domain configuration
4. Redeploy

### Environment Variables
For production deployments, consider:

```bash
# Set environment
export NODE_ENV=production

# Custom stack name
export STACK_NAME=TeamVacationCalendar-Prod
```

## Management Commands

```bash
# View deployment differences
npm run cdk:diff

# Update deployment
npm run deploy

# Destroy deployment (removes all AWS resources)
npm run cdk:destroy

# Fresh deployment (destroy + deploy)
npm run deploy:fresh
```

## Monitoring and Logs

### CloudFormation Console
- Monitor deployment status
- View stack events and outputs
- Access resource details

### CloudFront Console
- Monitor distribution status
- View cache statistics
- Configure cache behaviors

### S3 Console
- View uploaded files
- Monitor storage usage
- Configure bucket policies

## Troubleshooting

### Common Issues

**1. AWS Credentials Not Configured**
```bash
aws configure
# Enter your Access Key ID and Secret Access Key
```

**2. Region Not Set**
```bash
aws configure set region us-east-1
```

**3. CDK Bootstrap Required**
```bash
cdk bootstrap
```

**4. Build Failures**
```bash
# Clear cache and rebuild
npm run build
```

**5. Deployment Stuck**
- Check CloudFormation console for detailed error messages
- Ensure AWS permissions are sufficient

### Getting Help

1. Check AWS CloudFormation console for detailed error messages
2. Review CDK documentation: https://docs.aws.amazon.com/cdk/
3. AWS Support: https://console.aws.amazon.com/support/

## Security Considerations

### Default Security Features
- S3 bucket blocks public access
- CloudFront Origin Access Control restricts S3 access
- HTTPS-only access enforced
- Modern TLS protocols only

### Additional Security (Production)
- Enable AWS WAF for CloudFront
- Set up CloudTrail for audit logging
- Configure S3 access logging
- Enable GuardDuty for threat detection

## Backup and Disaster Recovery

### Automated Backups
- S3 versioning (can be enabled)
- CloudFormation stack templates
- CDK source code in Git

### Recovery Process
1. Restore from Git repository
2. Run deployment script
3. Update DNS if using custom domain

## Cost Optimization

### Built-in Optimizations
- CloudFront caching reduces S3 requests
- Gzip compression enabled
- Price Class 100 (North America + Europe only)

### Additional Optimizations
- Enable S3 Intelligent Tiering
- Configure CloudFront TTL settings
- Monitor usage with AWS Cost Explorer

## Support

For deployment issues or questions:
1. Check this documentation
2. Review AWS CloudFormation events
3. Check AWS service status: https://status.aws.amazon.com/