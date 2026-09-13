from __future__ import annotations

import os

class ResearchSafetyError(RuntimeError):
    """Raised when the research runtime is pointed at live trading."""


ALLOWED_MODES = frozenset({"research", "paper"})
_TRUE = frozenset({"1", "true", "yes"})


def assert_research_only(env: dict[str, str] | None = None) -> str:
    """Refuse live trading configuration.

    Returns the normalized mode when it is safe for research.
    """
    source = env if env is not None else os.environ
    raw_mode = source.get("POLYMARKET_BOT_MODE", "research")
    mode = (raw_mode or "research").strip().lower() or "research"
    live_raw = source.get("POLYMARKET_BOT_LIVE_TRADING_ENABLED", "false")
    live_enabled = (live_raw or "false").strip().lower() in _TRUE

    if mode == "live" or live_enabled:
        raise ResearchSafetyError(
            "Research runtime refuses live trading configuration"
        )
    if mode not in ALLOWED_MODES:
        raise ResearchSafetyError(f"Unsupported mode for research runtime: {mode}")
    return mode
