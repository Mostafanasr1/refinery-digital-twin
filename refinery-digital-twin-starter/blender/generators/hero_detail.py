"""Optional secondary detail, generated per type without replacing base geometry."""
import math
from .equipment import Kit, platform


def cage(k, x, bottom, top, prefix='hero_cage'):
    radius = .48
    for i in range(max(2, int((top - bottom) / 1.6) + 1)):
        z = bottom + i * (top - bottom) / max(1, int((top - bottom) / 1.6))
        k.torus(f'{prefix}_hoop_{i}', (x, 0, z), radius, .025, k.steel, segments=16)
    for i in range(5):
        angle = math.pi * (.15 + i * .175)
        k.box(f'{prefix}_upright_{i}', (x + radius * math.cos(angle), radius * math.sin(angle), (bottom + top) / 2), (.035, .035, top - bottom), k.steel)


def flange(k, suffix, location, radius=.28, axis='Y'):
    k.cyl(suffix + '_neck', location, radius * .7, .6, k.steel, axis=axis)
    k.cyl(suffix + '_flange', location, radius, .13, k.steel, axis=axis)
    x, y, z = location
    for i in range(8):
        a = i * math.tau / 8
        point = (x + radius * .8 * math.cos(a), y - .09, z + radius * .8 * math.sin(a)) if axis == 'Y' else (x + radius * .8 * math.cos(a), y + radius * .8 * math.sin(a), z + .09)
        k.cyl(suffix + f'_bolt_{i}', point, .025, .05, k.steel, axis=axis)


def column(k):
    cage(k, k.r + 1.15, 2.5, k.h - .6)
    for i, fraction in enumerate((.25, .5, .75)):
        z = k.h * fraction
        flange(k, f'hero_column_manway_{i}', (0, -k.r - .25, z + 1.0), .38)
        for j in range(8):
            a = j * math.tau / 8
            k.route(f'hero_platform_bracket_{i}_{j}', [(k.r * math.cos(a), k.r * math.sin(a), z - .8), ((k.r + .75) * math.cos(a), (k.r + .75) * math.sin(a), z - .12)], .045, k.steel)


def flare(k):
    # Base stack and foundation remain intact; this optional group supplies access.
    for i, fraction in enumerate((.25, .5, .75, .92)):
        k.add(platform(k.name + f'_hero_platform_{i}', k.h * fraction, k.r + .8, k.steel, k.rail, 1))
    for side in (-.35, .35):
        k.box(f'hero_ladder_rail_{side}', (k.r + .9, side, k.h * .46), (.06, .06, k.h * .92), k.steel)
    for i in range(1, int(k.h * .92 / .35)):
        k.box(f'hero_ladder_rung_{i}', (k.r + .9, 0, i * .35), (.06, .7, .06), k.steel)
    cage(k, k.r + 1.2, 2.5, k.h * .9)
    for i in range(6):
        a = i * math.tau / 6
        k.cyl(f'hero_tip_pilot_{i}', ((k.r * 1.3 + .12) * math.cos(a), (k.r * 1.3 + .12) * math.sin(a), k.h + .9), .045, 2.0, k.steel)


def heater(k):
    y = -k.width / 2 - 1
    z = min(k.h * .55, 6)
    k.box('hero_platform_0', (0, y, z), (k.length + 1, 1.2, .16), k.steel)
    for i in range(max(2, int(k.length / 1.5)) + 1):
        x = -k.length / 2 + i * k.length / max(2, int(k.length / 1.5))
        k.box(f'hero_rail_post_{i}', (x, y - .6, z + .55), (.06, .06, 1.1), k.rail)
    for height in (.55, 1.1):
        k.box(f'hero_handrail_{height}', (0, y - .6, z + height), (k.length + 1, .06, .06), k.rail)
    count = max(4, int(z / .22))
    for i in range(count):
        k.box(f'hero_stair_{i}', (-k.length / 2 + i * .24, y - 1.3, (i + 1) * z / count), (.28, 1, .10), k.rail)
    for side in (-.5, .5):
        k.route(f'hero_stair_handrail_{side}', [(-k.length / 2, y - 1.3 + side, 1.1), (-k.length / 2 + (count - 1) * .24, y - 1.3 + side, z + 1.1)], .035, k.rail)
    k.box('hero_platform_landing', (-k.length / 2 + (count - 1) * .24, y - .9, z), (1.1, 1.4, .16), k.steel)
    for i, x in enumerate((-k.length / 3, 0, k.length / 3)):
        flange(k, f'hero_burner_{i}', (x, -k.width / 2 - .4, 2), .45)
        k.route(f'hero_burner_supply_{i}', [(x, -k.width / 2 - .65, 1.8), (x, -k.width / 2 - .65, .7)], .07, k.steel)
    k.route('hero_fuel_header', [(-k.length / 2, -k.width / 2 - .65, .7), (k.length / 2, -k.width / 2 - .65, .7)], .10, k.steel)
    for i in range(4):
        k.torus(f'hero_stack_band_{i}', (0, 0, k.h + 1 + i * 3), 1.12, .06, k.steel, segments=24)


def tank(k):
    flange(k, 'hero_tank_manway', (0, -k.r - .3, 1.8), .55)
    for i in range(3):
        x = (i - 1) * k.r * .4
        y = -math.sqrt(k.r * k.r - x * x) - .25
        flange(k, f'hero_tank_nozzle_{i}', (x, y, 3.0), .22)
    # Existing spiral stair and roof rail remain; add stringer and toe-board detail.
    points = []
    for i in range(49):
        a = i * math.pi * 1.3 / 48
        points.append(((k.r + .8) * math.cos(a), (k.r + .8) * math.sin(a), .55 + k.h * i / 48))
    k.route('hero_stair_stringer', points, .065, k.steel)
    k.torus('hero_roof_toeboard', (0, 0, k.h + .8), k.r + .04, .06, k.rail, segments=64)


def rack(k):
    for bay, (start, end) in enumerate(((-k.length / 2, 0), (0, k.length / 2))):
        for side in (-1, 1):
            y = side * k.width / 2
            k.route(f'hero_cross_brace_{bay}_{side}', [(start, y, .3), (end, y, k.h * .6 - .3)], .075, k.steel)
    for level, z in enumerate((k.h * .6, k.h)):
        for i, x in enumerate((-k.length / 2, -k.length / 4, 0, k.length / 4, k.length / 2)):
            for j in range(4):
                k.box(f'hero_pipe_shoe_{level}_{i}_{j}', (x, -k.width / 2 + .8 + j, z + .35), (.25, .32, .12), k.steel)
        for side in (-.2, .2):
            k.box(f'hero_tray_edge_{level}_{side}', (0, k.width / 2 + side, z + .65), (k.length, .045, .18), k.steel)
        for i in range(max(2, int(k.length / .75))):
            x = -k.length / 2 + .3 + i * .75
            k.box(f'hero_tray_rung_{level}_{i}', (x, k.width / 2, z + .6), (.04, .4, .04), k.steel)


BUILDERS = {'column': column, 'flare': flare, 'fired_heater': heater, 'storage_tank': tank, 'floating_roof_tank': tank, 'pipe_rack': rack}


def build(asset, level=1):
    if level not in (0, 1):
        raise ValueError('Hero detail levels are 0 (base only) and 1 (secondary detail)')
    if not level or asset['type'] not in BUILDERS:
        return []
    k = Kit(asset, 0)  # Small parts need low radial tessellation, not base-model LOD.
    BUILDERS[k.kind](k)
    return k.objects
