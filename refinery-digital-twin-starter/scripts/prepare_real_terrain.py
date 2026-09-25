"""Create compact presentation terrain and textures from the recorded sources."""

from pathlib import Path
import json, hashlib, struct
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "tests/visual/output/stageC-task-03/sources"
out = ROOT / "data/normalized/assets/env"
for record in json.loads((ROOT / "docs/handbacks/evidence/stageC-task-03/source-intake.json").read_text(encoding="utf-8")):
    source_file = src / record["file"]
    if source_file.exists():
        assert hashlib.sha256(source_file.read_bytes()).hexdigest() == record["sha256"], str(source_file)

im = Image.open(src / "N28E033.tif")
# Inland southern Sinai crop; north-up rows, resampled to the presentation grid.
crop = (2340, 540, 3420, 1620)
height = im.crop(crop).convert("F").resize((257, 257), Image.Resampling.BILINEAR)
values = list(height.getdata())
assert min(values) > -100 and max(values) < 3000
(out / "sinai-height.bin").write_bytes(struct.pack("<" + str(len(values)) + "f", *values))
for asset, stem in [("gravelly_sand", "gravel"), ("rock_face_03", "rock")]:
    for channel, suffix in [("diff", "color"), ("nor_gl", "normal"), ("rough", "rough")]:
        image = Image.open(src / asset / (asset + "_" + channel + "_1k.jpg"))
        image.save(out / (stem + "-" + suffix + ".webp"), quality=88, method=6)
meta = dict(
    source="N28E033.tif",
    sourceSha256=hashlib.sha256((src / "N28E033.tif").read_bytes()).hexdigest(),
    cropPixels=crop,
    bounds={"west": 33.65, "east": 33.95, "north": 28.85, "south": 28.55},
    grid=257,
    format="little-endian float32 metres, north-up rows",
    resampling="bilinear",
    presentationExtentMetres=4200,
    verticalScale=0.28,
    notes="Recenter elevations and flatten a protected plant pad with smooth transition in runtime. Synthetic plant placement, not a surveyed Egyptian facility.",
)
(out / "sinai-terrain.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
print("Terrain source range", min(values), max(values))
