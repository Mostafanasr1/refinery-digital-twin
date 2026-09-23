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
};
/** Types whose generator draws its own foundation, so the site adds no concrete pad. */
export const selfFoundation = new Set<string>(['storage_tank']);
