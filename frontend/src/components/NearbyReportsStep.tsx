import { useEffect, useState } from 'react';
import type { Location, Nearby } from '../api/report-api';
import { formatCoordinate } from '../lib/location';
export function NearbyReportsStep({
  location,
  reports,
  message,
  onMatch,
  onNoMatch,
  onRetry,
  onApply,
  onCancel,
}: {
  location: Location | null;
  reports: Nearby[];
  message: string;
  onMatch: () => void;
  onNoMatch: () => void;
  onRetry: () => void;
  onApply: (latitude: number, longitude: number) => void;
  onCancel: () => void;
}) {
  const [lat, setLat] = useState(location ? String(location.latitude) : '');
  const [lng, setLng] = useState(location ? String(location.longitude) : '');
  const [error, setError] = useState('');
  useEffect(() => {
    setLat(location ? String(location.latitude) : '');
    setLng(location ? String(location.longitude) : '');
    setError('');
  }, [location?.latitude, location?.longitude]);
  const unavailable = message.includes('could not');
  const apply = () => {
    const latitude = Number(lat),
      longitude = Number(lng);
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError('Enter a latitude between -90 and 90 and a longitude between -180 and 180.');
      return;
    }
    setError('');
    onApply(latitude, longitude);
  };
  return (
    <section>
      <h2>Nearby reports</h2>
      {location && (
        <>
          <label>
            Latitude
            <input aria-label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
          </label>
          <label>
            Longitude
            <input aria-label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
          </label>
          <button onClick={apply}>Apply location</button>
          <p>
            Current lookup: {formatCoordinate(location.latitude)},{' '}
            {formatCoordinate(location.longitude)}
          </p>
        </>
      )}
      <p role="alert">{error}</p>
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
