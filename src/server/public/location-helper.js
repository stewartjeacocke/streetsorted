/* global document, navigator */
(() => {
  const form = document.querySelector('form[action="/report/location"]');
  const latitude = form?.querySelector('input[name="latitude"]');
  const longitude = form?.querySelector('input[name="longitude"]');
  if (!latitude || !longitude || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = String(position.coords.latitude);
      longitude.value = String(position.coords.longitude);
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
})();
