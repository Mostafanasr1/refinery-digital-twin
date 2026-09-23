"""Canonical asset silhouette types with metre-scale sample dimensions."""

SILHOUETTES = {
    "storage_tank": {
        "description": "Cone-roof atmospheric storage tank with spiral stair and roof handrail",
        "sample": {"height": 16.2, "diameter": 28, "length": 8, "width": 4},
    },
    "pump": {
        "description": "Horizontal centrifugal pump with motor, volute and discharge riser",
        "sample": {"height": 2, "diameter": 3, "length": 5, "width": 2},
    },
    "heat_exchanger": {
        "description": "Shell-and-tube exchanger on saddles with end flanges and nozzles",
        "sample": {"height": 4, "diameter": 2.5, "length": 10, "width": 4},
    },
    "fired_heater": {
        "description": "Box (cabin) fired heater with structural frame, burners and stack",
        "sample": {"height": 18, "diameter": 3, "length": 14, "width": 10},
    },
    "column": {
        "description": "Distillation column with skirt, platforms, ladder and draw-off risers",
        "sample": {"height": 44, "diameter": 6, "length": 8, "width": 4},
    },
    "vessel": {
        "description": "Vertical drum with skirt, platforms and ladder",
        "sample": {"height": 10, "diameter": 4, "length": 8, "width": 4},
    },
    "flare": {
        "description": "Guyed flare stack with tip and three braces",
        "sample": {"height": 65, "diameter": 3, "length": 8, "width": 4},
    },
    "pipe_rack": {
        "description": "Two-tier steel pipe rack with four pipe runs per tier",
        "sample": {"height": 8, "diameter": 3, "length": 22, "width": 5},
    },
    "building": {
        "description": "Concrete utility building with windows",
        "sample": {"height": 7, "diameter": 3, "length": 24, "width": 14},
    },
    "cooling_tower": {
        "description": "Mechanical-draft cooling tower with louvres and two fans",
        "sample": {"height": 12, "diameter": 3, "length": 12, "width": 10},
    },
    "floating_roof_tank": {
        "description": "External floating-roof tank: open top, pontoon deck below the rim, wind girder, rolling ladder",
        "sample": {"height": 16.2, "diameter": 28, "length": 8, "width": 4},
    },
    "sphere_tank": {
        "description": "LPG pressure sphere on tubular legs with cross bracing and a spiral stair to the crown",
        "sample": {"height": 20, "diameter": 16, "length": 8, "width": 4},
    },
    "bullet_tank": {
        "description": "Horizontal LPG bullet with dished heads on concrete saddles, top walkway and relief valve",
        "sample": {"height": 5, "diameter": 3.5, "length": 20, "width": 4},
    },
    "reactor": {
        "description": "Thick-walled hydrotreating reactor: tall skirt, hemispherical heads, top inlet, two platforms",
        "sample": {"height": 24, "diameter": 3.6, "length": 8, "width": 4},
    },
    "horizontal_drum": {
        "description": "Horizontal separator drum with dished heads on steel saddles, water boot and top platform",
        "sample": {"height": 5, "diameter": 2.6, "length": 8, "width": 4},
    },
    "air_cooler": {
        "description": "Fin-fan air cooler: elevated bundle with header boxes, fan rings, motors and side walkway",
        "sample": {"height": 8, "diameter": 3, "length": 12, "width": 6},
    },
    "compressor": {
        "description": "Motor-driven centrifugal compressor on a concrete base under an open shelter",
        "sample": {"height": 6, "diameter": 3, "length": 9, "width": 4},
    },
}
