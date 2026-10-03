const base = import.meta.env.VITE_API_ORIGIN || 'http://127.0.0.1:3000';
export type Location = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
};
export type Nearby = {
  id: string;
  categoryName: string | null;
  recordedAt: string | null;
  locationLabel: string | null;
  statusName: string | null;
  description: string | null;
};
export async function nearby(location: Location) {
  const r = await fetch(
    `${base}/api/nearby-reports?latitude=${location.latitude}&longitude=${location.longitude}`,
  );
  const b = await r.json().catch(() => null);
  return (
    b ?? {
      state: 'unavailable',
      residentMessage: 'Nearby reports could not be retrieved. Please try again.',
    }
  );
}
export async function submit(payload: {
  category: 'fly-tipping';
  location: Location;
  description: string;
  confirmed: true;
}) {
  const r = await fetch(`${base}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const b = await r.json().catch(() => null);
  return (
    b ?? {
      state: 'unconfirmed',
      reference: null,
      residentMessage: 'We could not confirm that the report was submitted.',
      retryAllowed: true,
    }
  );
}
