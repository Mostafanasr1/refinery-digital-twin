import { describe, expect, it, vi } from 'vitest';
import { JsonNormalizedDataLoader } from './loader';

describe('normalized JSON loader', () => {
  it('loads all collections from the configured normalized URL', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]'));
    // Each request needs its own response body.
    fetcher.mockImplementation(async () => new Response('[]'));
    const data = await new JsonNormalizedDataLoader('/normalized', fetcher).load();
    expect(data.assets).toEqual([]);
    expect(Object.keys(data)).toHaveLength(10);
    expect(fetcher.mock.calls.map(call => call[0])).toEqual([
      '/normalized/assets.json', '/normalized/connections.json',
      '/normalized/telemetry.json', '/normalized/process_paths.json', '/normalized/scenarios.json',
      '/normalized/model_bindings.json', '/normalized/facilities.json', '/normalized/areas.json', '/normalized/units.json', '/normalized/documents.json',
    ]);
  });
  it('rejects malformed records before exposing data', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => new Response('[{}]'));
    await expect(new JsonNormalizedDataLoader('./', fetcher).load()).rejects.toThrow('assets:');
  });
  it('reports missing files', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => new Response('', { status: 404 }));
    await expect(new JsonNormalizedDataLoader('./', fetcher).load()).rejects.toThrow('HTTP 404');
  });
  it('propagates cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
      options?.signal?.throwIfAborted();
      return new Response('[]');
    });
    await expect(new JsonNormalizedDataLoader('./', fetcher).load(controller.signal)).rejects.toThrow();
  });
});
