#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TeamVacationCalendarStack } from './team-vacation-calendar-stack';

const app = new cdk.App();

new TeamVacationCalendarStack(app, 'TeamVacationCalendarStack', {
  env: {
    // Deploy to the default AWS account/region
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Team Vacation Calendar - S3 + CloudFront deployment',
});

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'TeamVacationCalendar');
cdk.Tags.of(app).add('Environment', 'Production');
cdk.Tags.of(app).add('CostCenter', 'Engineering');