"""Presentation-only part mapping, applied before the export joins named parts."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG = json.loads((ROOT / 'data/presentation/materials.json').read_text(encoding='utf-8'))


def role_for(kind, part_name, source_material):
    mapping = CONFIG['types'][kind]
    role = mapping[source_material]
    for rule in CONFIG['partRules']:
        if re.search(rule['pattern'], part_name) and source_material in rule['materials']:
            role = rule['role']
            break
    if role not in CONFIG['materials']:
        raise ValueError(f'Undefined material {kind}/{part_name}: {role}')
    return role


def apply_part_materials(asset, parts):
    """Keep original engineering shader values; encode photoreal role in the name."""
    import bpy
    records = []
    for part in parts:
        suffix = part.name.removeprefix(asset['model_ref'] + '_')
        for slot in part.material_slots:
            original = slot.material
            role = role_for(asset['type'], suffix, original.name)
            name = original.name + '::' + role
            mapped = bpy.data.materials.get(name)
            if mapped is None:
                mapped = original.copy()
                mapped.name = name
            slot.material = mapped
            records.append({'part': suffix, 'source': original.name, 'role': role})
    return records
