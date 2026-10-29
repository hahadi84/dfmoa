export const RECENT_OBSERVATION_MS = 3 * 24 * 60 * 60 * 1000;
export function observationState(value, now = Date.now()) {
  const time = Date.parse(value ?? '');
  if (!Number.isFinite(time) || time > now + 60_000) return 'unknown';
  return now - time > RECENT_OBSERVATION_MS ? 'historical' : 'recent';
}
export function formatObservationTime(value) {
  if (!Number.isFinite(Date.parse(value ?? ''))) return '';
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
}
