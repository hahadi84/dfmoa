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
  // A second, separate user request approves the verified four-store benefit fix.
  const requested = korean.toISOString().slice(0, 10) === '2026-10-29' &&
    [requestedRelease, 'release(requested-benefits): 2026-10-29'].includes(subject);
  const adsRequested = korean.toISOString().slice(0, 10) === '2026-10-30' && subject === 'release(requested-ads): 2026-10-30';
  const airportRequested = korean.toISOString().slice(0, 10) === '2026-10-31' && subject === 'release(requested-airport): 2026-10-31';
  return context === 'production' && (scheduled || requested || adsRequested || airportRequested) &&
    /^[a-f0-9]{40}$/i.test(currentCommit ?? '') &&
    /^[a-f0-9]{40}$/i.test(previousCommit ?? '') && previousCommit !== currentCommit &&
    typeof previousSubject === 'string' && previousSubject !== subject && !earlierReleaseThisWeek;
}
