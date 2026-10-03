const base = () => window.REPORT_API_ORIGIN || "";
export async function lookupNearbyReports(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  });
  const response = await fetch(`${base()}/api/nearby-reports?${params}`);
  const body = await response.json().catch(() => null);
  if (!body)
    return {
      state: "unavailable",
      residentMessage:
        "Nearby reports could not be retrieved. Please try again.",
    };
  return body;
}
export async function submitReport(payload) {
  const response = await fetch(`${base()}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!body)
    throw new Error("We could not confirm that the report was submitted.");
  return body;
}
