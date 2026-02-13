# Diffusion Theory Discussion Space

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/Shiying-Zhang/diffusion-theory-discussion.svg)](https://github.com/Shiying-Zhang/diffusion-theory-discussion/stargazers)

> **"Good questions guide good discussions, which in turn inspire solid work."**

A collaborative space by Diego and Shiying for discussing the theoretical foundations of diffusion models.

## Website

**[https://shiying-zhang.github.io/diffusion-theory-discussion/](https://shiying-zhang.github.io/diffusion-theory-discussion/)**

## Project Structure

```
data/           Single source of truth for paper database
docs/           Documentation and reading list
notes/          Reading notes (DDPM, Score-based SDE)
scripts/        Python tools (search, add, update, report)
website/        Interactive website (chart, papers, issues)
```

## Quick Start

```bash
# Search papers
python scripts/search_papers.py --stats

# Add a paper (interactive)
python scripts/add_paper.py --interactive

# Update reading status
python scripts/update_status.py --id ddpm_2020 --status completed --rating 5

# Generate report
python scripts/generate_report.py --output report.html
```

## Documentation

- **[System & Usage Guide](docs/README.md)** - Full documentation
- **[Paper Reading List](docs/paper-reading-list.md)** - Curated reading list with tracks
- **[Deployment Guide](docs/deployment.md)** - GitHub Pages setup

## Reading Notes

- [DDPM Notes](notes/ddpm.md) - Denoising Diffusion Probabilistic Models
- [Score-based SDE Notes](notes/score-based-sde.md) - Score-Based Generative Modeling through SDEs

## How to Participate

- **Ask questions**: [Create an Issue](https://github.com/Shiying-Zhang/diffusion-theory-discussion/issues/new)
- **Add papers**: `python scripts/add_paper.py --interactive`
- **Contribute**: Fork, branch, PR

## Contributors

- **[Diego](https://github.com/your-username)** - Theory and mathematical analysis
- **[Shiying](https://github.com/Shiying-Zhang)** - Questions and empirical analysis

## License

MIT License - see [LICENSE](LICENSE) for details.
