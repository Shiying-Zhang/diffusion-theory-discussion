# GitHub Pages Deployment Guide

## Current Setup

The website is automatically deployed to GitHub Pages using GitHub Actions when code is pushed to the `main` branch.

**Live URL:** https://shiying-zhang.github.io/diffusion-theory-discussion/

### Deployment Workflow

1. **Trigger**: Push to `main` branch or manual dispatch
2. **Build**: GitHub Actions assembles the site from `website/`, `data/`, and `notes/`
3. **Deploy**: Uploaded to GitHub Pages

### What Gets Deployed

```
_site/
├── (all website/* files)
├── css/style.css
├── js/*.js
├── papers/paper.html
├── data/papers.json     ← JS fetch() target
├── notes/*.md           ← Notes accessible via links
├── assets/              ← SVG diagram
└── README.md
```

The `interactive.html` is copied to `index.html` to serve as the homepage.

### Workflow File

Configuration: `.github/workflows/deploy.yml`

## Page Structure

- **Homepage**: Interactive Theory Chart
- **Papers**: /papers.html
- **Issues**: /issues.html
- **Paper Details**: /papers/paper.html?id=xxx
- **Notes**: /notes/ddpm.md, /notes/score-based-sde.md

## Manual Deployment

1. Go to "Actions" tab in GitHub
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow" on `main` branch

## Setup (One-time)

1. Repository Settings > Pages
2. Source: "GitHub Actions"
3. The workflow runs automatically on push

## Local Development

```bash
# From repository root
python -m http.server 8000
# Open http://localhost:8000/website/
```

## Troubleshooting

- **Deployment failed?** Check Actions tab for errors
- **Pages not updating?** Wait 1-2 minutes, hard refresh (Ctrl+F5)
- **404 errors?** Verify file paths in the deployed site
