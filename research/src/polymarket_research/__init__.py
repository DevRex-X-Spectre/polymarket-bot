"""Research runtime for the Polymarket bot.

This package must remain incapable of submitting live orders.
"""

from .datasets import dataset_root, repository_root
from .safety import ResearchSafetyError, assert_research_only

__all__ = [
    "ResearchSafetyError",
    "assert_research_only",
    "dataset_root",
    "repository_root",
]
