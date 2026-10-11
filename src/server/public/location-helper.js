/* global document, navigator, fetch */
(() => {
  const form = document.querySelector('form[action="/report/location"]');
  const postcode = form?.querySelector('input[name="postcode"]');
  const csrf = form?.querySelector('input[name="csrf"]');
  if (!form || !postcode || !csrf || !navigator.geolocation) return;
  let changed = false;
  postcode.addEventListener('input', () => {
    changed = true;
  });
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (changed || postcode.value) return;
      try {
        const response = await fetch('/report/location/suggestion', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            csrf: csrf.value,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        });
        if (!response.ok || changed || postcode.value) return;
        const suggestion = await response.json();
        if (typeof suggestion.postcode === 'string' && !changed && !postcode.value)
          postcode.value = suggestion.postcode;
      } catch {
        // Manual postcode entry remains available when suggestion lookup fails.
      }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
})();
