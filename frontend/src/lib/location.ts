import type { Location } from '../api/report-api';
export const fresh = (l: Location | null) => !!l && Date.now() - Date.parse(l.capturedAt) <= 300000;
export function locate(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error());
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          accuracyMeters: p.coords.accuracy,
          capturedAt: new Date(p.timestamp).toISOString(),
        }),
      () => reject(new Error()),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
