# Team Vacation Calendar

A comprehensive, **100% free** team vacation calendar application with AWS deployment support. Built with React, TypeScript, and modern web technologies.

![Team Vacation Calendar](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![AWS](https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-orange)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🌟 Features

### Core Functionality
- 📅 **Interactive Calendar View** - Month and week views with intuitive navigation
- 👥 **Team Member Management** - Add, edit, and manage team members
- ✅ **Vacation Request Workflow** - Submit, review, and approve vacation requests
- 📊 **Export Capabilities** - Export to CSV, JSON, iCal, Confluence, and Jira formats
- 🔍 **Advanced Filtering** - Filter by employee, department, status, type, and date range
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Integration Ready
- 🔗 **Confluence Integration** - Export vacation tables and calendars
- 🎯 **Jira Integration** - Create tickets and reports from vacation data
- 📧 **Email Support** - Ready for notification integrations
- 🔐 **Authentication Ready** - Prepared for enterprise auth systems

### AWS Deployment
- ☁️ **One-Click Deployment** - Deploy to AWS with a single command
- 💰 **Cost Optimized** - Designed for minimal AWS costs (<$6/month)
- 🚀 **Auto-Scaling** - CloudFront CDN for global performance
- 🔒 **Secure by Default** - HTTPS-only with proper security configurations

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/team-vacation-calendar.git
cd team-vacation-calendar

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 to view the application.

### One-Click AWS Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to AWS (requires AWS CLI configured)
./deploy.sh
```

See [AWS Deployment Guide](docs/AWS_DEPLOYMENT.md) for detailed instructions.

## 📋 Prerequisites

### For Local Development
- Node.js 18+ 
- npm or yarn

### For AWS Deployment
- AWS Account (free tier eligible)
- AWS CLI configured
- Node.js 18+

## 📁 Project Structure

```
team-vacation-calendar/
├── src/
│   ├── components/         # React components
│   │   ├── Calendar.tsx    # Main calendar component
│   │   ├── VacationRequestForm.tsx
│   │   └── FilterPanel.tsx
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   │   ├── dateUtils.ts   # Date manipulation
│   │   └── exportUtils.ts # Export functionality
│   ├── types/             # TypeScript definitions
│   ├── styles/            # CSS modules
│   └── data/              # Mock data and sample data
├── infrastructure/        # AWS CDK deployment
│   ├── app.ts            # CDK app entry point
│   └── team-vacation-calendar-stack.ts
├── docs/                 # Documentation
│   ├── AWS_DEPLOYMENT.md
│   └── GITHUB_SETUP.md
├── public/               # Static assets
└── deploy.sh             # One-click deployment script
```

## 🎯 Usage

### Creating Vacation Requests
1. Click on any date in the calendar
2. Fill out the vacation request form
3. Select type: Vacation, Sick Leave, Personal, or Holiday
4. Add a reason and submit

### Managing Requests
- View all requests in the calendar
- Filter by employee, status, type, or date range
- Export data in multiple formats

### Confluence Integration
1. Use the "Export > Confluence" feature
2. Copy the generated table markup
3. Paste into your Confluence page

### Jira Integration
1. Use the "Export > Jira" feature
2. Copy the generated table markup
3. Create or update Jira tickets with vacation data

## 🔧 Configuration

### Team Data
Update `src/data/mockData.ts` with your team information:

```typescript
export const sampleTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Your Name',
    email: 'your.email@company.com',
    role: 'admin',
    department: 'Engineering',
    isActive: true
  },
  // Add more team members...
];
```

## 🚀 Deployment Options

### AWS S3 + CloudFront (Recommended)
- **Cost**: ~$6/month for small teams
- **Features**: Global CDN, HTTPS, auto-scaling
- **Setup**: One-click deployment with our script

### Alternative Platforms
- **Netlify**: Drag and drop `dist/` folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Enable in repository settings

## 💰 Cost Breakdown (AWS)

| Service | Monthly Cost | Description |
|---------|-------------|-------------|
| S3 Storage | <$1 | Static file hosting |
| CloudFront | <$5 | Global CDN and HTTPS |
| **Total** | **<$6** | Complete hosting solution |

*Costs for small teams (<100 users, <10GB traffic)*

## 🔒 Security Features

- **HTTPS Only**: All traffic encrypted in transit
- **Origin Access Control**: S3 bucket not publicly accessible
- **Modern TLS**: TLS 1.2+ enforced
- **XSS Protection**: Content Security Policy headers
- **No Server**: Static hosting eliminates server vulnerabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## 📖 Documentation

- [AWS Deployment Guide](docs/AWS_DEPLOYMENT.md) - Complete AWS setup instructions
- [GitHub Setup Guide](docs/GITHUB_SETUP.md) - Repository setup and management

## 🆘 Support

### Common Issues
- **Node.js Version**: Ensure you're using Node.js 18+
- **AWS Permissions**: Verify AWS CLI is configured correctly
- **Build Errors**: Clear cache with `npm run build`

### Getting Help
1. Check the documentation in the `docs/` folder
2. Search existing GitHub Issues
3. Create a new issue with detailed description

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**This project is 100% free for commercial and personal use.**

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Vite** - For lightning-fast development experience
- **AWS CDK** - For infrastructure as code
- **Lucide React** - For beautiful icons
- **date-fns** - For reliable date manipulation

---

**⭐ Star this repository if you find it useful!**

Built with ❤️ for teams who value work-life balance.
```
