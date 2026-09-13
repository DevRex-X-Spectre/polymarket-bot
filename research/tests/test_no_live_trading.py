from pathlib import Path

import polymarket_research
import tomllib


def test_package_exposes_no_order_api() -> None:
    assert not hasattr(polymarket_research, "place_order")
    assert not hasattr(polymarket_research, "submit_order")
    assert not hasattr(polymarket_research, "create_order")


def test_research_dependencies_exclude_trading_clients() -> None:
    pyproject = Path(__file__).resolve().parents[1] / "pyproject.toml"
    parsed = tomllib.loads(pyproject.read_text(encoding="utf-8"))
    deps = [dep.lower() for dep in parsed["project"]["dependencies"]]
    joined = " ".join(deps)
    assert "py-clob-client" not in joined
    assert "clob-client" not in joined
    assert "web3" not in joined
