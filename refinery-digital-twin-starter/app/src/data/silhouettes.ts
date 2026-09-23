/** Fallback primitive shape per canonical asset type when GLB geometry is unavailable. */
export type ProxyFamily = 'vertical' | 'horizontal' | 'box' | 'sphere' | 'rack' | 'pump' | 'stack';
export const proxyFamily: Record<string, ProxyFamily> = {
  storage_tank: 'vertical',
  pump: 'pump',
  heat_exchanger: 'horizontal',
  fired_heater: 'box',
  column: 'vertical',
  vessel: 'vertical',
  flare: 'vertical',
  pipe_rack: 'rack',
  building: 'box',
  cooling_tower: 'box',
  floating_roof_tank: 'vertical',
  sphere_tank: 'sphere',
  bullet_tank: 'horizontal',
  reactor: 'vertical',
  horizontal_drum: 'horizontal',
  air_cooler: 'box',
  compressor: 'pump',
  cylindrical_heater: 'vertical',
  stack: 'stack',
  hyperbolic_cooling_tower: 'vertical',
  substation: 'box',
  control_room: 'box',
};
/** Types whose generator draws its own foundation, so the site adds no concrete pad. */
export const selfFoundation = new Set<string>(['storage_tank', 'floating_roof_tank', 'sphere_tank', 'hyperbolic_cooling_tower']);
