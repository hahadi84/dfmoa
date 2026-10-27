import test from 'node:test';
import assert from 'node:assert/strict';
import { koreanWeekStart, allowWeeklyBuild } from './weekly-release-policy.mjs';

test('release week follows Monday in Korea, including the UTC Sunday boundary', () => {
  assert.equal(koreanWeekStart(new Date('2026-11-01T14:59:59Z')), '2026-10-26');
  assert.equal(koreanWeekStart(new Date('2026-11-01T15:00:00Z')), '2026-11-02');
});
test('only an explicit current Monday production release may build', () => {
  const input = { subject: 'release(weekly): 2026-11-02', context: 'production', now: new Date('2026-11-02T00:00:00Z') };
  assert.equal(allowWeeklyBuild(input), true);
  for (const subject of ['chore(snapshot): data [skip netlify]', 'fix: categories', 'release(weekly): 2026-10-26'])
    assert.equal(allowWeeklyBuild({ ...input, subject }), false);
  assert.equal(allowWeeklyBuild({ ...input, context: 'deploy-preview' }), false);
  assert.equal(allowWeeklyBuild({ ...input, now: new Date('2026-11-03T00:00:00Z') }), false);
});
