"""Fetch pinned CC0 sources and compress web textures: python scripts/build_environment.py."""
from pathlib import Path
from io import BytesIO
import hashlib
import json
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data/normalized/assets/env'
SOURCES = [
    ('sky.hdr', 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloofendal_43d_clear_puresky_2k.hdr', '62f7cb7b1dac5a90a5bbde728606773b'),
    ('sand-color.webp', 'https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/sand_01/sand_01_diff_1k.png', '2a0bb026ff6270a8b633f6a9a3492e58'),
    ('sand-normal.webp', 'https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/sand_01/sand_01_nor_gl_1k.png', '4005969e85765551ccf8f121e8ee3bbd'),
    ('sand-rough.webp', 'https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/sand_01/sand_01_rough_1k.png', '1b0b2c4ead63bc95240aea9739b9a670'),
]

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    records = []
    for name, url, expected in SOURCES:
        request = urllib.request.Request(url, headers={'User-Agent': 'RefineryDigitalTwin/1.0'})
        source = urllib.request.urlopen(request, timeout=120).read()
        if hashlib.md5(source).hexdigest() != expected:
            raise RuntimeError(f'Source checksum changed: {name}')
        path = DEST / name
        if name.endswith('.hdr'):
            path.write_bytes(source)
        else:
            image = Image.open(BytesIO(source)).convert('RGB')
            image.save(path, 'WEBP', lossless=True, method=6)
        records.append({'file': name, 'url': url, 'license': 'CC0-1.0', 'sourceMd5': expected,
                        'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    (DEST / 'sources.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(records, indent=2))

if __name__ == '__main__':
    main()
