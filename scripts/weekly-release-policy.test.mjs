import test from 'node:test';
import assert from 'node:assert/strict';
import { koreanWeekStart, allowWeeklyBuild } from './weekly-release-policy.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { claimWeeklyRelease } from './prepare-weekly-release.mjs';

test('release week follows Monday in Korea, including the UTC Sunday boundary', () => {
  assert.equal(koreanWeekStart(new Date('2026-11-01T14:59:59Z')), '2026-10-26');
  assert.equal(koreanWeekStart(new Date('2026-11-01T15:00:00Z')), '2026-11-02');
});
test('only an explicit current Monday production release may build', () => {
  const input = { subject: 'release(weekly): 2026-11-02', context: 'production', currentCommit: 'a'.repeat(40), previousCommit: 'b'.repeat(40), previousSubject: 'chore(snapshot): previous [skip netlify]', now: new Date('2026-11-02T00:00:00Z') };
  assert.equal(allowWeeklyBuild(input), true);
  for (const subject of ['chore(snapshot): data [skip netlify]', 'fix: categories', 'release(weekly): 2026-10-26'])
    assert.equal(allowWeeklyBuild({ ...input, subject }), false);
  assert.equal(allowWeeklyBuild({ ...input, context: 'deploy-preview' }), false);
  assert.equal(allowWeeklyBuild({ ...input, now: new Date('2026-11-03T00:00:00Z') }), false);
  assert.equal(allowWeeklyBuild({ ...input, now: new Date('2026-11-01T23:59:00Z') }), false);
  assert.equal(allowWeeklyBuild({ ...input, previousCommit: input.currentCommit }), false);
  assert.equal(allowWeeklyBuild({ ...input, previousCommit: undefined }), false);
  assert.equal(allowWeeklyBuild({ ...input, previousSubject: input.subject }), false);
  assert.equal(allowWeeklyBuild({ ...input, earlierReleaseThisWeek: true }), false);
});
test('two runs cannot claim the same weekly release; next week remains independent', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'dfmoa-release-'));
  try {
    claimWeeklyRelease(folder, '2026-11-02');
    assert.throws(() => claimWeeklyRelease(folder, '2026-11-02'), { code: 'EEXIST' });
    claimWeeklyRelease(folder, '2026-11-09');
  } finally {
    for (const file of fs.readdirSync(folder)) fs.unlinkSync(path.join(folder, file));
    fs.rmdirSync(folder);
  }
});

test('explicit user-requested release is limited to October 29 KST and cannot repeat', () => {
  const input = { subject: 'release(requested): 2026-10-29', context: 'production', currentCommit: 'a'.repeat(40), previousCommit: 'b'.repeat(40), previousSubject: 'chore(snapshot): previous [skip netlify]', now: new Date('2026-10-29T01:00:00Z') };
  assert.equal(allowWeeklyBuild(input), true);
  for (const override of [
    { now: new Date('2026-10-28T14:59:59Z') },
    { now: new Date('2026-10-29T15:00:00Z') },
    { subject: 'release(requested): 2026-10-30' },
    { subject: 'fix: ordinary change' },
    { context: 'deploy-preview' },
    { earlierReleaseThisWeek: true },
    { previousSubject: input.subject },
    { previousCommit: input.currentCommit },
    { previousCommit: undefined },
  ]) assert.equal(allowWeeklyBuild({ ...input, ...override }), false);
});

test('separate benefits publication requires the specifically approved subject and same KST date',()=>{
  const input={subject:'release(requested-benefits): 2026-10-29',context:'production',currentCommit:'a'.repeat(40),previousCommit:'b'.repeat(40),previousSubject:'release(requested): 2026-10-29',now:new Date('2026-10-29T03:00:00Z')};
  assert.equal(allowWeeklyBuild(input),true);
  for(const override of [{earlierReleaseThisWeek:true},{previousSubject:input.subject},{now:new Date('2026-10-29T15:00:00Z')},{context:'deploy-preview'},{subject:'release(requested-benefits): 2026-10-30'}])assert.equal(allowWeeklyBuild({...input,...override}),false);
});
