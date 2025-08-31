#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const team_vacation_calendar_stack_1 = require("./team-vacation-calendar-stack");
const app = new cdk.App();
new team_vacation_calendar_stack_1.TeamVacationCalendarStack(app, 'TeamVacationCalendarStack', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vaW5mcmFzdHJ1Y3R1cmUvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUFxQztBQUNyQyxpREFBbUM7QUFDbkMsaUZBQTJFO0FBRTNFLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLElBQUksd0RBQXlCLENBQUMsR0FBRyxFQUFFLDJCQUEyQixFQUFFO0lBQzlELEdBQUcsRUFBRTtRQUNILDJDQUEyQztRQUMzQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0tBQ3ZDO0lBQ0QsV0FBVyxFQUFFLHFEQUFxRDtDQUNuRSxDQUFDLENBQUM7QUFFSCw0QkFBNEI7QUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBUZWFtVmFjYXRpb25DYWxlbmRhclN0YWNrIH0gZnJvbSAnLi90ZWFtLXZhY2F0aW9uLWNhbGVuZGFyLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxubmV3IFRlYW1WYWNhdGlvbkNhbGVuZGFyU3RhY2soYXBwLCAnVGVhbVZhY2F0aW9uQ2FsZW5kYXJTdGFjaycsIHtcbiAgZW52OiB7XG4gICAgLy8gRGVwbG95IHRvIHRoZSBkZWZhdWx0IEFXUyBhY2NvdW50L3JlZ2lvblxuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04sXG4gIH0sXG4gIGRlc2NyaXB0aW9uOiAnVGVhbSBWYWNhdGlvbiBDYWxlbmRhciAtIFMzICsgQ2xvdWRGcm9udCBkZXBsb3ltZW50Jyxcbn0pO1xuXG4vLyBBZGQgdGFncyB0byBhbGwgcmVzb3VyY2VzXG5jZGsuVGFncy5vZihhcHApLmFkZCgnUHJvamVjdCcsICdUZWFtVmFjYXRpb25DYWxlbmRhcicpO1xuY2RrLlRhZ3Mub2YoYXBwKS5hZGQoJ0Vudmlyb25tZW50JywgJ1Byb2R1Y3Rpb24nKTtcbmNkay5UYWdzLm9mKGFwcCkuYWRkKCdDb3N0Q2VudGVyJywgJ0VuZ2luZWVyaW5nJyk7Il19