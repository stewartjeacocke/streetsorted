export const MAX_LOCATION_AGE_MS = 5 * 60 * 1000;

export function isLocationFresh(location, now = Date.now()) {
  const capturedAt = Date.parse(location?.capturedAt || '');
  return Number.isFinite(capturedAt) && capturedAt <= now && now - capturedAt <= MAX_LOCATION_AGE_MS;
}

export function requestBrowserLocation() {
  if (!navigator.geolocation) return Promise.reject(new Error('Location is not supported by this browser.'));
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
    position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy, capturedAt: new Date(position.timestamp).toISOString() }),
    () => reject(new Error('Location access is required to submit this report.')), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  ));
}
