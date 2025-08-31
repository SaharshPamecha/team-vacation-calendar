# GitHub Repository Setup Guide

Follow these steps to create a GitHub repository for your Team Vacation Calendar project.

## Step 1: Create Repository on GitHub

1. Go to https://github.com and sign in to your account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `team-vacation-calendar`
   - **Description**: `A comprehensive team vacation calendar with AWS deployment`
   - **Visibility**: Choose Public or Private
   - **Initialize**: Leave unchecked (we already have files)
5. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/team-vacation-calendar.git

# Set the default branch name
git branch -M main

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Team Vacation Calendar with AWS deployment"

# Push to GitHub
git push -u origin main
```

## Step 3: Repository Settings (Recommended)

### Enable GitHub Pages (Optional)
1. Go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: Select `main` and `/docs` folder
4. This will host your documentation

### Add Repository Topics
Add these topics to help others discover your project:
- `vacation-calendar`
- `team-management`
- `react`
- `typescript`
- `aws`
- `s3`
- `cloudfront`
- `calendar`
- `vacation-tracker`

### Branch Protection (For Teams)
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews"
4. Enable "Require status checks"

## Step 4: Add Collaborators (Optional)

1. Go to Settings > Collaborators
2. Click "Add people"
3. Enter usernames or email addresses
4. Choose permission level:
   - **Read**: View repository
   - **Write**: Push to repository
   - **Admin**: Full access

## Step 5: Set Up Issues and Projects (Optional)

### Issue Templates
Create `.github/ISSUE_TEMPLATE/` directory with:
- `bug_report.md`
- `feature_request.md`
- `deployment_issue.md`

### Project Board
1. Go to Projects tab
2. Create new project
3. Add columns: Todo, In Progress, Done
4. Link to issues and pull requests

## Step 6: CI/CD with GitHub Actions (Advanced)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Deploy to AWS
      run: npm run cdk:deploy
```

Add these secrets in Settings > Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Repository Structure

Your final repository structure:

```
team-vacation-calendar/
├── .github/
│   └── workflows/
├── docs/
│   └── AWS_DEPLOYMENT.md
├── infrastructure/
│   ├── app.ts
│   └── team-vacation-calendar-stack.ts
├── src/
│   ├── components/
│   ├── data/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── .gitignore
├── README.md
├── deploy.sh
├── package.json
└── cdk.json
```

## Useful Git Commands

```bash
# Check status
git status

# Add specific files
git add filename.txt

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name

# Merge branch
git merge branch-name
```

## Best Practices

1. **Commit Messages**: Use clear, descriptive messages
2. **Branching**: Create feature branches for new development
3. **Documentation**: Keep README and docs updated
4. **Security**: Never commit sensitive data (AWS keys, etc.)
5. **Releases**: Use GitHub releases for version tags

## Maintenance

### Regular Updates
- Update dependencies: `npm update`
- Security patches: `npm audit fix`
- Documentation updates

### Monitoring
- Watch repository for issues
- Monitor AWS costs
- Review deployment logs

## Getting Help

- GitHub Docs: https://docs.github.com/
- Git Handbook: https://guides.github.com/introduction/git-handbook/
- Community Support: https://github.community/