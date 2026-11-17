import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function moduleAt(path, context, require = () => { throw new Error('Unexpected import'); }) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { ...context, exports, require });
  return exports;
}

function harness(debug = false) {
  const window = { location: new URL(`https://www.dfmoa.com/en/compare${debug ? '?debug_mode=1' : ''}`) };
  const document = { title: 'Shopping cost comparison' };
  const timers = new Map();
  let timer = 0;
  let effect;
  const ref = { current: null };
  window.setTimeout = fn => { timers.set(++timer, fn); return timer; };
  window.clearTimeout = id => timers.delete(id);
  const context = { window, document, URLSearchParams };
  const { analyticsBootstrap } = moduleAt('../src/lib/analytics-bootstrap.ts', context);
  const boot = () => vm.runInNewContext(analyticsBootstrap('G-TAG', 'G-DESTINATION'), context);
  const { GoogleAnalyticsPageView } = moduleAt('../src/components/google-analytics-page-view.tsx', context, id => {
    if (id === 'react') return { useRef: () => ref, useEffect: fn => { effect = fn; } };
    if (id === 'next/navigation') return {
      usePathname: () => window.location.pathname,
      useSearchParams: () => new URLSearchParams(window.location.search),
    };
    throw new Error(`Unexpected import: ${id}`);
  });
  const render = () => { GoogleAnalyticsPageView({ measurementId: 'G-DESTINATION' }); return effect() ?? (() => {}); };
  const flush = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); };
  const views = () => Array.from(window.dataLayer ?? [], args => Array.from(args)).filter(args => args[1] === 'page_view');
  return { window, boot, render, flush, views };
}

test('initial page view queues before the route observer or Google script loads', () => {
  const h = harness(true);
  h.boot();
  assert.equal(h.views().length, 1);
  assert.equal(h.views()[0][2].send_to, 'G-DESTINATION');
  assert.equal(h.views()[0][2].debug_mode, true);
  assert.equal(h.views()[0][2].page_path, '/en/compare?debug_mode=1');
});

test('hydration and remount do not duplicate the initial view; navigation and back do count', () => {
  const h = harness();
  h.boot();
  let cleanup = h.render(); h.flush(); cleanup();
  cleanup = h.render(); h.flush(); cleanup();
  assert.equal(h.views().length, 1);
  h.window.location = new URL('https://www.dfmoa.com/ja/compare');
  cleanup = h.render(); h.flush(); cleanup();
  h.window.location = new URL('https://www.dfmoa.com/ja/compare?mode=store');
  cleanup = h.render(); h.flush(); cleanup();
  h.window.location = new URL('https://www.dfmoa.com/en/compare');
  h.render(); h.flush();
  assert.deepEqual(h.views().map(args => args[2].page_path), ['/en/compare', '/ja/compare', '/ja/compare?mode=store', '/en/compare']);
  assert.equal(h.views()[0][2].debug_mode, undefined);
});

test('a cancelled route effect sends no stale view', () => {
  const h = harness(); h.boot();
  h.window.location = new URL('https://www.dfmoa.com/ja/compare');
  h.render()(); h.flush();
  assert.equal(h.views().length, 1);
});

test('bootstrap IDs cannot break out of the inline script', () => {
  const { analyticsBootstrap } = moduleAt('../src/lib/analytics-bootstrap.ts', {});
  assert.equal(analyticsBootstrap('</script>', '</script>').includes('</script>'), false);
});

