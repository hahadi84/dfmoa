export function koreanWeekStart(now = new Date()) {
  const korean = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  korean.setUTCDate(korean.getUTCDate() - ((korean.getUTCDay() + 6) % 7));
  return korean.toISOString().slice(0, 10);
}

// A release is explicit; daily snapshots and ordinary source commits never publish.
export function allowWeeklyBuild({ subject, context, currentCommit, previousCommit, previousSubject, earlierReleaseThisWeek = false, now = new Date() }) {
  const korean = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const release = `release(weekly): ${koreanWeekStart(now)}`;
  // User explicitly requested publication today (2026-10-29). This exception
  // expires with that Korean calendar day; ordinary/manual future commits stay held.
  const requestedRelease = 'release(requested): 2026-10-29';
  const scheduled = korean.getUTCDay() === 1 && korean.getUTCHours() >= 9 && subject === release;
  const requested = korean.toISOString().slice(0, 10) === '2026-10-29' && subject === requestedRelease;
  return context === 'production' && (scheduled || requested) &&
    /^[a-f0-9]{40}$/i.test(currentCommit ?? '') &&
    /^[a-f0-9]{40}$/i.test(previousCommit ?? '') && previousCommit !== currentCommit &&
    typeof previousSubject === 'string' && previousSubject !== subject && !earlierReleaseThisWeek;
}
