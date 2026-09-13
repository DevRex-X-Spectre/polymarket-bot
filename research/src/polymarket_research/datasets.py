from __future__ import annotations

from pathlib import Path


def repository_root() -> Path:
    """Return the monorepo root (independent of the TypeScript runtime)."""
    return Path(__file__).resolve().parents[3]


def dataset_root() -> Path:
    """Return the shared research dataset directory under /data."""
    return repository_root() / "data"
