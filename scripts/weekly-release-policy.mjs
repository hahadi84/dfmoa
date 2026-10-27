export function koreanWeekStart(now = new Date()) {
  const korean = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  korean.setUTCDate(korean.getUTCDate() - ((korean.getUTCDay() + 6) % 7));
  return korean.toISOString().slice(0, 10);
}

// A release is explicit; daily snapshots and ordinary source commits never publish.
export function allowWeeklyBuild({ subject, context, now = new Date() }) {
  const korean = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return context === 'production' && korean.getUTCDay() === 1 &&
    subject === `release(weekly): ${koreanWeekStart(now)}`;
}
