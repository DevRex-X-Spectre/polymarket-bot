# Research runtime

Isolated Python environment for quantitative analysis, datasets, and experiments.

This runtime **cannot submit live orders**. It does not depend on the TypeScript trading application and refuses `POLYMARKET_BOT_MODE=live`.

## Setup

Use Python 3.12 (3.11+ is supported; 3.14 is not pinned because research wheels may lag).

```bash
python3.12 -m venv .venv
# Windows:
.venv\Scripts\activate
python -m pip install -U pip
python -m pip install -e ".[dev]"
python -m pytest
```

## Data

Datasets live in `/data` at the repository root, not inside this package. See `data/README.md`.
