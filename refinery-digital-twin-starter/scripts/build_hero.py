"""One-command optional detail export; canonical and approved base files untouched."""
from pathlib import Path
import os
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
executable = os.environ.get('BLENDER_BIN') or shutil.which('blender')
if not executable and Path('D:/blender/blender.exe').exists():
    executable = 'D:/blender/blender.exe'
if not executable:
    raise SystemExit('Set BLENDER_BIN')
subprocess.run([executable, '--background', '--python-exit-code', '1', '--python', str(ROOT / 'blender/scripts/build_hero_detail.py')], cwd=ROOT, check=True)
