from polymarket_research.datasets import dataset_root, repository_root


def test_dataset_root_is_independent_of_trading_runtime() -> None:
    root = repository_root()
    data = dataset_root()
    assert (root / "docs").is_dir()
    assert data == root / "data"
    assert data.is_dir()
    assert not (root / "apps" / "trader").joinpath("src").is_relative_to(data)
