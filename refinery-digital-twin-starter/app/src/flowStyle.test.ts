import {it,expect} from 'vitest';
import {flowStyleFromUrl,flowStyleUrl} from './flowStyle';
it('defaults to pipes and keeps unrelated URL state when selecting arcs',()=>{
 const url=new URL('https://demo.test/next/?look=photoreal-night&measure=1#demo');expect(flowStyleFromUrl(url)).toBe('pipes');
 const next=flowStyleUrl(url,'arcs');expect(next.searchParams.get('look')).toBe('photoreal-night');expect(next.hash).toBe('#demo');expect(flowStyleFromUrl(next)).toBe('arcs');expect(flowStyleFromUrl(new URL('https://demo.test/?flow=bad'))).toBe('pipes');
});
