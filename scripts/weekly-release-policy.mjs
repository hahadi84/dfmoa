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
  const searchAdRequested = korean.toISOString().slice(0, 10) === '2026-11-01' && subject === 'release(requested-search-ad): 2026-11-01';
  const unifiedAirportRequested = korean.toISOString().slice(0, 10) === '2026-11-02' && ['release(requested-airport-all): 2026-11-02', 'release(requested-airport-font-fix): 2026-11-02'].includes(subject);
  const shoppingRequested = korean.toISOString().slice(0, 10) === "2026-11-05" && ["release(requested-shopping-seo): 2026-11-05", "release(requested-shopping-list): 2026-11-05", "release(requested-shopping-actions): 2026-11-05"].includes(subject);
  const marketShoppingRequested = korean.toISOString().slice(0,10) === '2026-11-06' && subject === 'release(requested-market-shopping): 2026-11-06';
  const internationalAdsRequested = korean.toISOString().slice(0,10) === '2026-11-06' && subject === 'release(requested-international-ads): 2026-11-06';
  const naverRequested = korean.toISOString().slice(0,10) === '2026-11-07' && subject === 'release(requested-naver-verification): 2026-11-07';
  const snippetsRequested = korean.toISOString().slice(0,10) === '2026-11-07' && subject === 'release(requested-structured-data): 2026-11-07';
  return context === 'production' && (scheduled || requested || adsRequested || airportRequested || searchAdRequested || unifiedAirportRequested || shoppingRequested || marketShoppingRequested || internationalAdsRequested || naverRequested || snippetsRequested) &&
    /^[a-f0-9]{40}$/i.test(currentCommit ?? '') &&
    /^[a-f0-9]{40}$/i.test(previousCommit ?? '') && previousCommit !== currentCommit &&
    typeof previousSubject === 'string' && previousSubject !== subject && !earlierReleaseThisWeek;
}
