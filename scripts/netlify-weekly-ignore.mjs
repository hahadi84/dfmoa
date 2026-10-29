import { execFileSync } from 'node:child_process';
import { allowWeeklyBuild } from './weekly-release-policy.mjs';

try {
  const subject = execFileSync('git', ['log', '-1', '--format=%s'], { encoding: 'utf8' }).trim();
  const currentCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const previousCommit = process.env.CACHED_COMMIT_REF;
  if (!/^[a-f0-9]{40}$/i.test(previousCommit ?? '')) throw new Error('Previous build could not be verified');
  const previousSubject = execFileSync('git', ['log', '-1', '--format=%s', previousCommit], { encoding: 'utf8' }).trim();
  const earlierSubjects = execFileSync('git', ['log', '--format=%s', 'HEAD^'], { encoding: 'utf8' }).split(/\r?\n/);
  const allowed = allowWeeklyBuild({ subject, context: process.env.CONTEXT, currentCommit, previousCommit,
    previousSubject, earlierReleaseThisWeek: earlierSubjects.includes(subject) });
  console.log(allowed ? 'Approved release: build.' : 'Hold changes for the weekly Monday release.');
  // Netlify ignore: 0 cancels; 1 proceeds. No dependencies are available here.
  process.exitCode = allowed ? 1 : 0;
} catch {
  console.log('Release approval could not be verified: hold deployment.');
  process.exitCode = 0;
}
