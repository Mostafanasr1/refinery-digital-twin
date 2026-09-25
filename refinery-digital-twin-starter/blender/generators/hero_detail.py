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


def vertical_service(k):
    """Insulation bands, instrument tubing and service nozzles per vessel type."""
    top = 2.6 + k.h * .62 if k.kind == 'cylindrical_heater' else k.h
    for i in range(1, max(2, int(top / 2))):
        z = i * 2
        if k.kind == 'cylindrical_heater' and z < 2.6:
            continue
        radius = k.r * (1 - .3 * (z - .8) / (k.h - .8)) if k.kind == 'stack' else k.r
        k.torus(f'slice_band_{i}', (0, 0, z), radius + .025, .025, k.steel, segments=40)
    if k.kind in ('stack', 'cylindrical_heater'):
        return
    for i, z in enumerate((1.6, k.h * .4, k.h * .8)):
        flange(k, f'slice_service_{i}', (0, -k.r - .3, z), .24)
    k.route('slice_instrument', [(k.r + .12, -.2, .7), (k.r + .12, -.2, k.h * .85)], .035, k.steel)


def horizontal_service(k):
    cz = k.r + 1.5 if k.kind == 'bullet_tank' else max(k.h - k.r, k.r + .8) if k.kind == 'horizontal_drum' else k.r + 1
    for i, x in enumerate((-k.length * .35, 0, k.length * .35)):
        ring = k.torus(f'slice_saddle_band_{i}', (x, 0, cz), k.r + .035, .045, k.steel, segments=32)
        ring.rotation_euler.y = math.pi / 2
        flange(k, f'slice_top_nozzle_{i}', (x, 0, cz + k.r + .2), .28, axis='Z')
    k.route('slice_service_pipe', [(-k.length * .4, -k.r - .4, 1), (k.length * .4, -k.r - .4, 1)], .1, k.steel)


def spherical_service(k):
    cz = k.h - k.r
    for i, latitude in enumerate((-.45, 0, .45)):
        k.torus(f'slice_sphere_seam_{i}', (0, 0, cz + k.r * latitude), k.r * math.sqrt(1 - latitude ** 2) + .015, .028, k.steel, segments=64)
    flange(k, 'slice_sphere_roof', (0, 0, k.h + .15), .4, axis='Z')
    count = 12 if k.r >= 8 else 8
    for i in range(count):
        a, b = i * math.tau / count, (i + 1) * math.tau / count
        k.route(f'slice_leg_brace_{i}', [(k.r * .92 * math.cos(a), k.r * .92 * math.sin(a), .8), (k.r * .92 * math.cos(b), k.r * .92 * math.sin(b), cz * .75)], .08, k.steel)


def machine_service(k):
    compressor = k.kind == 'compressor'
    center = -k.length / 4
    length = k.length * .42 if compressor else k.length * .5
    height, radius = (1.75, .98) if compressor else (1.1, .73)
    for i in range(12):
        x = center - length * .45 + i * length * .9 / 11
        k.cyl(f'slice_motor_fin_{i}', (x, 0, height), radius, .045, k.steel, axis='X')
    k.box('slice_local_panel', (k.length * .3, -k.width / 2 - .3, 1.6), (.65, .3, 1), k.shell)
    for i in range(2):
        flange(k, f'slice_machine_connection_{i}', (i * .7, -k.width / 2 - .1, 1), .25)


def building_service(k):
    for i in range(max(2, int(k.length / 3))):
        x = -k.length / 2 + 1 + i * 3
        k.box(f'slice_roof_seam_{i}', (x, 0, k.h + .42), (.055, k.width, .035), k.steel)
    for side in (-1, 1):
        k.route(f'slice_rainwater_{side}', [(side * (k.length / 2 - .25), -k.width / 2 - .1, .2), (side * (k.length / 2 - .25), -k.width / 2 - .1, k.h)], .065, k.steel)
    for i in range(8):
        k.box(f'slice_vent_slat_{i}', (-k.length * .3, -k.width / 2 - .08, 1.5 + i * .13), (1.4, .12, .045), k.steel)


def cooling_service(k):
    for side in (-1, 1):
        for i in range(max(4, int(k.h * 2))):
            k.box(f'slice_louvre_{side}_{i}', (0, side * (k.width / 2 + .04), .8 + i * .4), (k.length, .12, .06), k.steel)
    for x in (-k.length / 2, k.length / 2):
        k.route(f'slice_cooling_brace_{x}', [(x, -k.width / 2, .4), (x, k.width / 2, k.h * .7)], .065, k.steel)


def hyperbolic_service(k):
    k.torus('slice_basin_rail', (0, 0, 1.2), k.r + .9, .05, k.rail, segments=64)
    for i in range(32):
        a = i * math.tau / 32
        k.cyl(f'slice_basin_post_{i}', ((k.r + .9) * math.cos(a), (k.r + .9) * math.sin(a), .75), .04, .9, k.rail)
    k.route('slice_return_header', [(k.r + 2, -k.r, 1.2), (k.r + 2, k.r, 1.2)], .35, k.steel)


BASE_BUILDERS = {'column': column, 'flare': flare, 'fired_heater': heater, 'storage_tank': tank, 'floating_roof_tank': tank, 'pipe_rack': rack}
SERVICE_BUILDERS = {
    'column': vertical_service, 'vessel': vertical_service, 'reactor': vertical_service,
    'stack': vertical_service, 'flare': vertical_service, 'cylindrical_heater': vertical_service,
    'storage_tank': vertical_service, 'floating_roof_tank': vertical_service,
    'heat_exchanger': horizontal_service, 'bullet_tank': horizontal_service,
    'horizontal_drum': horizontal_service, 'sphere_tank': spherical_service,
    'pump': machine_service, 'compressor': machine_service,
    'building': building_service, 'control_room': building_service, 'substation': building_service,
    'cooling_tower': cooling_service, 'air_cooler': cooling_service,
    'hyperbolic_cooling_tower': hyperbolic_service,
    'fired_heater': building_service, 'pipe_rack': rack,
}
BUILDERS = SERVICE_BUILDERS


def build(asset, level=1):
    if level not in (0, 1):
        raise ValueError('Hero detail levels are 0 (base only) and 1 (secondary detail)')
    if not level or asset['type'] not in BUILDERS:
        return []
    k = Kit(asset, 0)  # Small parts need low radial tessellation, not base-model LOD.
    if k.kind in BASE_BUILDERS:
        BASE_BUILDERS[k.kind](k)
    if k.kind != 'pipe_rack':
        SERVICE_BUILDERS[k.kind](k)
    else:
        # Additional insulated runs above the base rack, repeated for every rack.
        for i in range(6):
            k.route(f'slice_overhead_pipe_{i}', [(-k.length / 2, -k.width / 2 + .5 + i * .5, k.h + .8), (k.length / 2, -k.width / 2 + .5 + i * .5, k.h + .8)], .11, k.shell)
    return k.objects
