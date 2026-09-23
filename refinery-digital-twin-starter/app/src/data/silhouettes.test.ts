import { expect, it } from 'vitest';
import schema from '../../../schemas/asset.schema.json';
import { proxyFamily, selfFoundation } from './silhouettes';

it('every canonical asset type has a proxy family and nothing else does', () => {
  const types = schema.properties.type.enum as string[];
  expect(Object.keys(proxyFamily).sort()).toEqual([...types].sort());
  for (const type of selfFoundation) expect(types).toContain(type);
});
