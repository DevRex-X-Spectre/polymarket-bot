import pytest

from polymarket_research.safety import ResearchSafetyError, assert_research_only


def test_defaults_to_research() -> None:
    assert assert_research_only({}) == "research"


def test_allows_paper() -> None:
    assert assert_research_only({"POLYMARKET_BOT_MODE": "paper"}) == "paper"


def test_rejects_live_mode() -> None:
    with pytest.raises(ResearchSafetyError):
        assert_research_only({"POLYMARKET_BOT_MODE": "live"})


def test_rejects_live_enable_flag() -> None:
    with pytest.raises(ResearchSafetyError):
        assert_research_only(
            {
                "POLYMARKET_BOT_MODE": "research",
                "POLYMARKET_BOT_LIVE_TRADING_ENABLED": "true",
            }
        )


def test_rejects_unknown_mode() -> None:
    with pytest.raises(ResearchSafetyError):
        assert_research_only({"POLYMARKET_BOT_MODE": "prod"})
