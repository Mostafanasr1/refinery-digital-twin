"""Run the silhouette checks in Blender; BLENDER_BIN overrides discovery."""

import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def main():
    executable = os.environ.get("BLENDER_BIN") or shutil.which("blender")
    if not executable and Path("D:/blender/blender.exe").exists():
        executable = "D:/blender/blender.exe"
    if not executable:
        raise SystemExit("Blender not found. Set BLENDER_BIN to your Blender executable")
    subprocess.run(
        [
            executable,
            "--background",
            "--python-exit-code",
            "1",
            "--python",
            str(ROOT / "blender/scripts/check_generators.py"),
        ],
        cwd=ROOT,
        check=True,
    )


if __name__ == "__main__":
    main()
