"""Build a pinned CC0-derived 1K KTX2 pack. Does not modify canonical data."""
from io import BytesIO
from pathlib import Path
import hashlib
import json
import math
import shutil
import subprocess
import tempfile
import urllib.request
from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/normalized/assets/materials'
CACHE = Path(tempfile.gettempdir()) / 'refinery-task4-basis'
ENCODER_URL = 'https://raw.githubusercontent.com/BinomialLLC/basis_universal/99f52d63aa6799cbdaecfe977111dc5ec3b31d47/bin/basisu_st.wasm'
ENCODER_SHA = 'b42d951b1bf146133578e8c7927ad4a4a857552846a46a3ee33b541b2a06bc7d'
SOURCES = {
    'metal_plate_02': {'diff': '5cb02c12674de25264222511214e3c62', 'nor_gl': '95504e9795834d3bd9b7818031d19f86', 'rough': '743fdbd128ed05ddb90af1d1c28c20a0'},
    'concrete_wall_007': {'diff': 'ab501a290c68239f9166e9ee69814d3e', 'nor_gl': 'd18ba67fbf9dbbf0968a3c2d83307326', 'rough': 'd2ce4d4f0cc2b92ddfca35563906f736'},
}


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'RefineryDigitalTwin/1.0'})
    return urllib.request.urlopen(request, timeout=120).read()


def grating_maps(size, tile_metres):
    """Procedural recessed grid: 50 mm pitch, 5 mm bars, no geometry changes.

    Dark recesses suggest openings; this opaque material does not create holes.
    The periodic height field also yields a seam-free tangent-space normal map.
    """
    pitch = .05
    cells = round(tile_metres / pitch)
    if cells < 1 or abs(cells * pitch - tile_metres) > 1e-6:
        raise ValueError('Grating tile must contain whole 50 mm cells')
    height = []
    for i in range(size):
        phase = (i * cells / size) % 1
        distance = min(phase, 1 - phase)
        height.append(max(0, min(1, (.065 - distance) / .03)))
    colors, normals, roughness = [], [], []
    pixel_metres = tile_metres / size
    for y in range(size):
        for x in range(size):
            level = max(height[x], height[y])
            dx = (max(height[(x + 1) % size], height[y]) - max(height[(x - 1) % size], height[y])) * .003 / (2 * pixel_metres)
            dy = (max(height[x], height[(y + 1) % size]) - max(height[x], height[(y - 1) % size])) * .003 / (2 * pixel_metres)
            length = math.sqrt(dx * dx + dy * dy + 1)
            normals.append(tuple(round(127.5 * (v / length + 1)) for v in (-dx, -dy, 1)))
            colors.append((round(50 + 190 * level),) * 3)
            roughness.append((round(250 - 45 * level),) * 3)
    maps = []
    for pixels in (colors, normals, roughness):
        image = Image.new('RGB', (size, size))
        image.putdata(pixels)
        maps.append(image)
    return maps


def main():
    CACHE.mkdir(exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    encoder = CACHE / 'basisu_st.wasm'
    if not encoder.exists():
        encoder.write_bytes(fetch(ENCODER_URL))
    if hashlib.sha256(encoder.read_bytes()).hexdigest() != ENCODER_SHA:
        raise RuntimeError('Encoder checksum mismatch')
    sources, images = [], {}
    for asset, maps in SOURCES.items():
        for channel, digest in maps.items():
            url = f'https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/{asset}/{asset}_{channel}_1k.png'
            path = CACHE / f'{asset}_{channel}.png'
            if not path.exists():
                path.write_bytes(fetch(url))
            data = path.read_bytes()
            if hashlib.md5(data).hexdigest() != digest:
                raise RuntimeError(f'Source checksum mismatch: {path.name}')
            images[asset, channel] = Image.open(BytesIO(data)).convert('RGB')
            sources.append({'url': url, 'license': 'CC0-1.0', 'sourceMd5': digest})
    config = json.loads((ROOT / 'data/presentation/materials.json').read_text(encoding='utf-8'))
    manifest = {'materials': {}, 'sources': sources, 'encoder': {'url': ENCODER_URL, 'sha256': ENCODER_SHA, 'version': '2.50.0', 'license': 'Apache-2.0'}, 'files': []}
    for role, definition in config['materials'].items():
        source = definition['source']
        gray = ImageOps.grayscale(images[source, 'diff']).convert('RGB')
        # Restrained neutral variation; material colour is applied at runtime.
        color = Image.blend(Image.new('RGB', gray.size, '#ffffff'), ImageEnhance.Contrast(gray).enhance(.8), definition['weathering'])
        normal = Image.blend(Image.new('RGB', gray.size, (128, 128, 255)), images[source, 'nor_gl'], definition['relief'])
        rough = Image.blend(Image.new('RGB', gray.size, '#ffffff'), images[source, 'rough'], .25)
        if role == 'grating':
            color, normal, rough = grating_maps(1024, definition['tileMetres'])
        maps = {}
        for channel, img in [('color', color), ('normal', normal), ('roughness', rough)]:
            name = f'{role}-{channel}'
            png = CACHE / f'{name}.png'
            img.save(png)
            output = CACHE / f'{name}.ktx2'
            command = [shutil.which('node') or 'node', str(ROOT / 'scripts/basis-encode.mjs'), str(encoder), str(CACHE), '-ktx2', '-uastc', '-uastc_level', '0', '-mipmap', '-file', f'/work/{png.name}', '-output_file', f'/work/{output.name}']
            if channel != 'color':
                command.append('-linear')
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL)
            dest = OUT / output.name
            shutil.copyfile(output, dest)
            data = dest.read_bytes()
            if data[:12] != b'\xabKTX 20\xbb\r\n\x1a\n':
                raise RuntimeError(f'Not KTX2: {dest}')
            maps[channel] = f'assets/materials/{dest.name}'
            manifest['files'].append({'file': dest.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        manifest['materials'][role] = {**definition, 'maps': maps}
        if role == 'grating':
            manifest['materials'][role]['source'] = 'Original procedural recessed grid; 50 mm pitch, 5 mm nominal bars; opaque'
        print(f'Built {role}: 1K KTX2 with mipmaps', flush=True)
    basis = ROOT / 'node_modules/three/examples/jsm/libs/basis'
    for name in ['basis_transcoder.js', 'basis_transcoder.wasm']:
        shutil.copyfile(basis / name, OUT / name)
        manifest['files'].append({'file': name, 'bytes': (OUT / name).stat().st_size, 'license': 'Apache-2.0', 'source': 'Installed Three.js Basis transcoder'})
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'materials': len(manifest['materials']), 'bytes': sum(item['bytes'] for item in manifest['files']), 'canonicalChanges': False}))


if __name__ == '__main__':
    main()
