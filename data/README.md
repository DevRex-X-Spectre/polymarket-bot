# Data

High-frequency and research datasets belong here.

```text
data/
  raw/         Immutable source extracts
  processed/   Normalized intermediate files
  research/    Experiment-ready Parquet / DuckDB inputs
```

Do not commit market dumps, Parquet files, or anything containing credentials.

The TypeScript trading runtime and the Python research runtime both treat this directory as the dataset root. PostgreSQL remains the operational store; this tree is for research files (D-027, D-028).
