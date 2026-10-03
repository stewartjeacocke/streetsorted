import { createReportState, States } from "./report-state.js";
import { createNearbyState, NearbyStates } from "./nearby-reports.js";
import { isLocationFresh, requestBrowserLocation } from "./location.js";
import { lookupNearbyReports, submitReport } from "./report-api.js";
const draft = createReportState();
const nearby = createNearbyState();
const $ = (id) => document.getElementById(id);
const steps = [
  "location-step",
  "nearby-step",
  "details-step",
  "review-step",
  "outcome-step",
];
function show(id) {
  steps.forEach((step) => ($(step).hidden = step !== id));
}
function message(value) {
  $("status-message").textContent = value;
}
function renderNearbyReports(reports) {
  $("nearby-list").replaceChildren(
    ...reports.map((report) => {
      const item = document.createElement("li");
      item.textContent = [
        report.categoryName,
        report.recordedAt && new Date(report.recordedAt).toLocaleString(),
        report.locationLabel,
        report.statusName,
        report.description,
      ]
        .filter(Boolean)
        .join(" — ");
      return item;
    }),
  );
}
function reset() {
  draft.discard();
  nearby.discard();
  $("description").value = "";
  $("description-error").textContent = "";
  $("retry-location").hidden = true;
  show("location-step");
  message("");
}
async function lookupNearby() {
  nearby.loading();
  draft.setLocation(draft.location);
  show("nearby-step");
  $("nearby-loading").hidden = false;
  $("nearby-list").hidden = true;
  $("nearby-question").hidden = true;
  $("nearby-empty").hidden = true;
  $("retry-nearby").hidden = true;
  try {
    const result = await lookupNearbyReports(draft.location);
    if (result.state === "reports-found") {
      nearby.found(result.reports);
      draft.nearbyFound();
      renderNearbyReports(result.reports);
      $("nearby-list").hidden = false;
      $("nearby-question").hidden = false;
    } else if (result.state === "no-results") {
      nearby.found([]);
      draft.continueAfterNearby();
      $("nearby-empty").hidden = false;
      $("continue-no-results").hidden = false;
    } else {
      throw new Error();
    }
  } catch {
    nearby.unavailable();
    draft.nearbyUnavailable();
    $("nearby-unavailable").hidden = false;
    $("retry-nearby").hidden = false;
  } finally {
    $("nearby-loading").hidden = true;
  }
}
async function getLocation() {
  message("Getting your location…");
  try {
    draft.setLocation(await requestBrowserLocation());
    $("retry-location").hidden = true;
    message("Location found. Checking nearby reports…");
    await lookupNearby();
  } catch (_) {
    $("retry-location").hidden = false;
    message("Location access is required. Please retry location detection.");
  }
}
function continueToDetails() {
  nearby.decide(NearbyStates.NO_MATCH);
  draft.continueAfterNearby();
  show("details-step");
  message("");
}
function stopForMatch() {
  nearby.decide(NearbyStates.MATCH);
  draft.discard();
  nearby.discard();
  $("outcome-message").textContent =
    "You indicated that a nearby report already matches this issue. No new report was submitted.";
  $("outcome-reference").textContent = "";
  $("retry-submission").hidden = true;
  show("outcome-step");
}
function ensureFreshLocation() {
  if (isLocationFresh(draft.location)) return true;
  message("Your location needs refreshing before you can submit this report.");
  getLocation();
  return false;
}
function review() {
  if (!ensureFreshLocation()) return;
  const description = $("description").value.trim();
  if (!description) {
    $("description-error").textContent = "Enter a description.";
    return;
  }
  draft.setDescription(description);
  draft.review();
  const location = draft.location;
  $("review-location").textContent =
    `Detected location (${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)})`;
  $("review-description").textContent = description;
  show("review-step");
}
async function confirm() {
  if (draft.state === States.SUBMITTING || !ensureFreshLocation()) return;
  draft.submitting();
  $("confirm-report").disabled = true;
  message("Submitting report…");
  try {
    const outcome = await submitReport({
      category: "fly-tipping",
      location: draft.location,
      description: draft.description,
      confirmed: true,
    });
    draft.outcome(outcome.state);
    $("outcome-message").textContent = outcome.residentMessage;
    $("outcome-reference").textContent = outcome.reference
      ? `Reference: ${outcome.reference}`
      : "";
    $("retry-submission").hidden = !outcome.retryAllowed;
    show("outcome-step");
  } catch (_) {
    draft.outcome(States.UNCONFIRMED);
    $("outcome-message").textContent =
      "We could not confirm that the report was submitted.";
    $("outcome-reference").textContent = "";
    $("retry-submission").hidden = false;
    show("outcome-step");
  } finally {
    $("confirm-report").disabled = false;
    message("");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  $("request-location").addEventListener("click", getLocation);
  $("retry-location").addEventListener("click", getLocation);
  $("retry-nearby").addEventListener("click", lookupNearby);
  $("nearby-match").addEventListener("click", stopForMatch);
  $("nearby-no-match").addEventListener("click", continueToDetails);
  $("continue-no-results").addEventListener("click", continueToDetails);
  $("review-report").addEventListener("click", review);
  $("edit-report").addEventListener("click", () => {
    draft.edit();
    show("details-step");
  });
  $("confirm-report").addEventListener("click", confirm);
  $("retry-submission").addEventListener("click", confirm);
  document
    .querySelectorAll(".cancel-report")
    .forEach((button) => button.addEventListener("click", reset));
});
