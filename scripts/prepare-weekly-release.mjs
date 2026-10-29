import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { koreanWeekStart } from './weekly-release-policy.mjs';

// Atomic local claim shared by concurrent runs in this checkout. A failed attempt
// remains claimed: another publication requires explicit operator intervention.
export function claimWeeklyRelease(gitDirectory, week) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) throw new Error('Invalid release week');
  const file = path.join(gitDirectory, `dfmoa-release-${week}.lock`);
  const handle = fs.openSync(file, 'wx', 0o600);
  try { fs.writeFileSync(handle, JSON.stringify({ week, claimedAt: new Date().toISOString() }) + '\n'); }
  finally { fs.closeSync(handle); }
  return file;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const now = new Date();
  const korean = new Date(now.getTime() + 9 * 3600000);
  if (korean.getUTCDay() !== 1 || korean.getUTCHours() < 9) throw new Error('Wait for Monday 09:00 KST');
  if (!process.argv.includes('--confirmed-no-published-release')) throw new Error('Check this week’s Netlify publication history first');
  const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
  if (git(['branch', '--show-current']) !== 'main') throw new Error('Release from main only');
  if (git(['status', '--porcelain', '--untracked-files=no'])) throw new Error('Commit validated changes with [skip netlify] first');
  const subject = `release(weekly): ${koreanWeekStart(now)}`;
  if (git(['log', '--format=%s']).split(/\r?\n/).includes(subject)) throw new Error('This week already has a release commit');
  claimWeeklyRelease(path.resolve(git(['rev-parse', '--git-dir'])), koreanWeekStart(now));
  execFileSync('git', ['-c', 'user.name=dfmoa-bot', '-c', 'user.email=bot@dfmoa.local', 'commit', '--allow-empty', '-m', subject], { stdio: 'inherit' });
  console.log('Release commit prepared. Recheck the publication history before pushing once.');
}
