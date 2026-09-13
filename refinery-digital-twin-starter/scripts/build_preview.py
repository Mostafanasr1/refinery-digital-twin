"""Run Blender with the canonical data; BLENDER_BIN overrides local discovery."""
import os
from pathlib import Path
import shutil
import subprocess
from pipeline.normalize import normalize
from pipeline.validate import ROOT

normalize(ROOT / "data/synthetic", ROOT / "data/normalized")
executable = os.environ.get("BLENDER_BIN") or shutil.which("blender")
if not executable and Path("D:/blender/blender.exe").exists():
    executable = "D:/blender/blender.exe"
if not executable:
    raise SystemExit("Set BLENDER_BIN to your Blender executable")
subprocess.run([executable, "--background", "--python-exit-code", "1", "--python",
                str(ROOT / "blender/scripts/build_preview.py")],
               cwd=ROOT, check=True)
