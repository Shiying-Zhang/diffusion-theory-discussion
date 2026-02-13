# Paper Reading List System & Website Documentation

## Project Architecture

This project provides a paper reading list management system and interactive website for tracking diffusion model research papers.

### Directory Structure

```
diffusion-theory-discussion/
├── data/               # Paper database (single source of truth)
│   ├── papers.json     # Main paper data
│   └── schema.json     # JSON schema definition
├── docs/               # Documentation
├── notes/              # Reading notes (markdown)
├── scripts/            # Python CLI tools
│   ├── constants.py    # Shared constants from schema
│   ├── add_paper.py    # Add new papers
│   ├── search_papers.py # Search and filter
│   ├── update_status.py # Update paper metadata
│   └── generate_report.py # Generate progress reports
├── website/            # Static website
│   ├── index.html      # SVG chart page
│   ├── interactive.html # Interactive network (main page)
│   ├── papers.html     # Paper reading list
│   ├── issues.html     # GitHub Issues visualization
│   ├── papers/paper.html # Individual paper details
│   ├── css/style.css   # Styles
│   ├── js/             # JavaScript modules
│   └── assets/         # SVG assets
└── README.md           # Project overview
```

## Quick Start

### View All Papers

```bash
python scripts/search_papers.py
python scripts/search_papers.py --stats
```

### Search and Filter

```bash
python scripts/search_papers.py --query "score matching"
python scripts/search_papers.py --topic "foundations"
python scripts/search_papers.py --status "unread"
python scripts/search_papers.py --year 2020
python scripts/search_papers.py --author "Ho"
python scripts/search_papers.py --topic "foundations" --priority "high" --status "unread"
python scripts/search_papers.py --sort "priority"
```

### Add New Papers

```bash
# Interactive mode (recommended)
python scripts/add_paper.py --interactive

# CLI mode
python scripts/add_paper.py \
  --title "Paper Title" \
  --authors "Author1,Author2" \
  --year 2024 \
  --venue "NeurIPS" \
  --arxiv "https://arxiv.org/abs/xxxx.xxxxx" \
  --topics "foundations,denoising_diffusion" \
  --level "intermediate" \
  --priority "high"
```

### Update Paper Info

```bash
python scripts/update_status.py --id ddpm_2020 --status completed --rating 5
python scripts/update_status.py --id ddpm_2020 --notes_file "notes/ddpm.md"
python scripts/update_status.py --id ddpm_2020 --tags "ddpm,noise_prediction"
python scripts/update_status.py --list  # List all paper IDs
```

### Generate Reports

```bash
python scripts/generate_report.py                      # Console output
python scripts/generate_report.py --output report.html  # HTML report
python scripts/generate_report.py --output stats.txt    # Text report
```

## Classification System

### Topics
- **foundations**: Theory fundamentals (score_based_models, denoising_diffusion)
- **methods**: Improvements (improved_sampling, training_stability, architecture, conditional_generation)
- **applications**: Use cases (image_generation, video_generation, 3d_generation, multimodal)
- **surveys**: Reviews (theory_survey, application_survey)

### Levels
- **beginner** / **intermediate** / **advanced**

### Priorities
- **high** (must read) / **medium** (recommended) / **low** (optional)

### Status
- **unread** / **reading** / **completed** / **review**

## Website

### Features
- Interactive SVG theory chart with zoom
- Paper network visualization with hover connections
- Dynamic paper list loaded from `data/papers.json`
- Individual paper detail pages
- GitHub Issues visualization
- Reading notes integration

### Local Development

```bash
# From repository root
python -m http.server 8000
# Open http://localhost:8000/website/
```

### Technical Details
- Georgia serif font, academic style
- 26% sidebar / 74% content layout
- JavaScript modules in `website/js/` for data loading
- All paper data fetched from `data/papers.json` at runtime

## Troubleshooting

**Scripts can't find database?** Scripts use relative paths from their own location. Run from any directory.

**Paper details page shows "Paper not found"?** The paper ID in the URL must match an entry in `data/papers.json`.

**Website not loading data?** Serve via HTTP server (not `file://`) for fetch() to work.
