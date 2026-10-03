import type { Nearby } from '../api/report-api';
export function NearbyReportsStep({
  reports,
  message,
  onMatch,
  onNoMatch,
  onRetry,
  onCancel,
}: {
  reports: Nearby[];
  message: string;
  onMatch: () => void;
  onNoMatch: () => void;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const unavailable = message.includes('could not');
  return (
    <section>
      <h2>Nearby reports</h2>
      <p role="status">{message}</p>
      {reports.length > 0 && (
        <>
          <ul>
            {reports.map((r) => (
              <li key={r.id}>
                {[
                  r.categoryName,
                  r.recordedAt && new Date(r.recordedAt).toLocaleString(),
                  r.locationLabel,
                  r.statusName,
                  r.description,
                ]
                  .filter(Boolean)
                  .join(' — ')}
              </li>
            ))}
          </ul>
          <p>Does any nearby report match the issue you want to report?</p>
          <button onClick={onMatch}>Yes, a report matches</button>
          <button onClick={onNoMatch}>No, none match</button>
        </>
      )}
      {!reports.length && !unavailable && message === 'No nearby reports were found.' && (
        <button onClick={onNoMatch}>Continue to report details</button>
      )}
      {unavailable && <button onClick={onRetry}>Retry nearby reports</button>}
      <button onClick={onCancel}>Cancel</button>
    </section>
  );
}
