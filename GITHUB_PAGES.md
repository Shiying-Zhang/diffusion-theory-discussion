# GitHub Pages Deployment Guide

This guide explains how to deploy the diffusion theory discussion website to GitHub Pages.

## Current Setup

The website is automatically deployed to GitHub Pages using GitHub Actions when code is pushed to the `main` branch.

### Deployment Workflow

1. **Trigger**: Any push to the `main` branch triggers the deployment workflow
2. **Build**: GitHub Actions builds the website from the `website/` directory
3. **Deploy**: The built site is deployed to `https://shiying-zhang.github.io/diffusion-theory-discussion/`

### Workflow File

The deployment configuration is in `.github/workflows/deploy.yml`.

## How It Works

1. **Source Files**: Located in `/website/` directory
   - `index.html` - Simple SVG chart
   - `interactive.html` - Interactive theory chart (becomes main page)
   - `papers.html` - Paper reading list
   - `issues.html` - GitHub Issues visualization
   - `papers/paper.html` - Individual paper details
   - `style.css` - Styles

2. **Deployment Process**:
   - GitHub Actions copies all files from `website/` directory
   - Makes `interactive.html` the main page (`index.html`)
   - Copies additional files like `Notes/` and `README.md`
   - Deploys to GitHub Pages

## Accessing the Website

Once deployed, the website will be available at:
**https://shiying-zhang.github.io/diffusion-theory-discussion/**

### Page Structure

- **Homepage**: Interactive Theory Chart (interactive.html)
- **Papers**: https://shiying-zhang.github.io/diffusion-theory-discussion/papers.html
- **Issues**: https://shiying-zhang.github.io/diffusion-theory-discussion/issues.html
- **Notes**: Available through the "View Notes" button or direct links

## Manual Deployment

You can also trigger deployment manually:
1. Go to the "Actions" tab in the GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Choose the branch (main) and click "Run workflow"

## Setup Instructions (One-time)

If you need to set up GitHub Pages for the first time:

1. Go to repository Settings
2. Navigate to "Pages" section
3. Under "Source", select "GitHub Actions"
4. The workflow is already configured and will run on the next push

## Features

### Interactive Theory Chart
- Hover over papers to see connections
- Shows 8 key diffusion theory papers and their relationships
- Lower section displays key variables and definitions

### Paper Reading List
- Visual cards showing all 11 papers
- Filter by type (Questions, Discussions, Theory, etc.)
- Link to paper details and notes

### GitHub Issues Visualization
- Real-time view of repository issues
- Filter by issue type
- Direct links to GitHub

### Notes Integration
- Links to DDPM and Score-based SDE notes
- Easy access from all pages

## Local Development

To test the website locally:

```bash
# Navigate to the website directory
cd website

# Serve with a simple HTTP server
python -m http.server 8000
# or
npx serve .

# Open browser to http://localhost:8000
```

## Updating Content

1. Edit files in the `website/` directory
2. Commit and push to `main` branch
3. GitHub Actions will automatically deploy changes
4. Wait 1-2 minutes for deployment to complete

## Troubleshooting

**Deployment failed?**
- Check the Actions tab for error details
- Ensure all HTML files are in the `website/` directory
- Verify file paths and links

**Pages not updating?**
- GitHub Pages can take 1-2 minutes to update
- Hard refresh the browser (Ctrl+F5)
- Clear browser cache

**404 errors?**
- Check that all file paths start from `website/` directory
- Verify all linked files exist

## License

MIT License - see LICENSE file for details
