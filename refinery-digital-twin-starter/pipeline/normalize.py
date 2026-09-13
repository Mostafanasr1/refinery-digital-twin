"""Source adapters and deterministic canonical output. Run from repository root."""
import argparse
import csv
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from pipeline.validate import COLLECTIONS, validate_directory


def read_source(source: Path, name: str) -> list:
    csv_path = source / f"{name}.csv"
    if csv_path.exists():
        with csv_path.open(encoding="utf-8-sig", newline="") as stream:
            rows = list(csv.DictReader(stream))
        for row in rows:
            for key in ["position", "rotation", "dimensions", "interactive", "synthetic"]:
                if key in row:
                    row[key] = json.loads(row[key])
        return rows
    return json.loads((source / f"{name}.json").read_text(encoding="utf-8-sig"))


def normalize(source: Path, output: Path) -> None:
    if source.resolve() == output.resolve():
        raise ValueError("Source and output must be separate directories")
    dataset = {}
    for name in COLLECTIONS:
        try:
            rows = read_source(source, name)
            if not isinstance(rows, list):
                raise ValueError("expected an array of records")
            dataset[name] = sorted(rows, key=lambda row: json.dumps(row, sort_keys=True))
        except (OSError, ValueError) as exc:
            raise ValueError(f"{name}: {exc}") from exc
    # Validate staging first so invalid sources never replace working output.
    with TemporaryDirectory() as temp:
        staging = Path(temp)
        for name, rows in dataset.items():
            (staging / f"{name}.json").write_text(
                json.dumps(rows, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        errors = validate_directory(staging)
        if errors:
            raise ValueError("\n".join(errors))
        output.mkdir(parents=True, exist_ok=True)
        for name in dataset:
            target = output / f"{name}.json"
            target.write_bytes((staging / target.name).read_bytes())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    try:
        normalize(args.source, args.output)
    except ValueError as exc:
        parser.exit(1, f"Normalization failed: {exc}\n")
    print(f"Validated normalized output written to {args.output}")


if __name__ == "__main__":
    main()
