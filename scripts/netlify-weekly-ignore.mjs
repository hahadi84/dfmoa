import { execFileSync } from 'node:child_process';
import { allowWeeklyBuild } from './weekly-release-policy.mjs';

try {
  const subject = execFileSync('git', ['log', '-1', '--format=%s'], { encoding: 'utf8' }).trim();
  const allowed = allowWeeklyBuild({ subject, context: process.env.CONTEXT });
  console.log(allowed ? 'Approved Monday release: build.' : 'Hold changes for the weekly Monday release.');
  // Netlify ignore: 0 cancels; 1 proceeds. No dependencies are available here.
  process.exitCode = allowed ? 1 : 0;
} catch {
  console.log('Release approval could not be verified: hold deployment.');
  process.exitCode = 0;
}
