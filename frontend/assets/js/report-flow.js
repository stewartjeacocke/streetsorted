import { createReportState, States } from './report-state.js';
import { isLocationFresh, requestBrowserLocation } from './location.js';
import { submitReport } from './report-api.js';

const draft = createReportState();
const $ = id => document.getElementById(id);
const steps = ['location-step', 'details-step', 'review-step', 'outcome-step'];
function show(id) { steps.forEach(step => $(step).hidden = step !== id); }
function message(value) { $('status-message').textContent = value; }
function reset() { draft.discard(); $('description').value = ''; $('description-error').textContent = ''; $('retry-location').hidden = true; show('location-step'); message(''); }
async function getLocation() {
  message('Getting your location…');
  try { draft.setLocation(await requestBrowserLocation()); $('retry-location').hidden = true; show('details-step'); message('Location found.'); }
  catch (error) { $('retry-location').hidden = false; message('Location access is required. Please retry location detection.'); }
}
function ensureFreshLocation() {
  if (isLocationFresh(draft.location)) return true;
  message('Your location needs refreshing before you can submit this report.');
  getLocation();
  return false;
}
function review() {
  if (!ensureFreshLocation()) return;
  const description = $('description').value.trim();
  if (!description) { $('description-error').textContent = 'Enter a description.'; return; }
  draft.setDescription(description); draft.review();
  const location = draft.location;
  $('review-location').textContent = `Detected location (${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)})`;
  $('review-description').textContent = description; show('review-step');
}
async function confirm() {
  if (draft.state === States.SUBMITTING || !ensureFreshLocation()) return;
  draft.submitting(); $('confirm-report').disabled = true; message('Submitting report…');
  try {
    const outcome = await submitReport({ category: 'fly-tipping', location: draft.location, description: draft.description, confirmed: true });
    draft.outcome(outcome.state); $('outcome-message').textContent = outcome.residentMessage;
    $('outcome-reference').textContent = outcome.reference ? `Reference: ${outcome.reference}` : '';
    $('retry-submission').hidden = !outcome.retryAllowed; show('outcome-step');
  } catch (_) { draft.outcome(States.UNCONFIRMED); $('outcome-message').textContent = 'We could not confirm that the report was submitted.'; $('outcome-reference').textContent = ''; $('retry-submission').hidden = false; show('outcome-step'); }
  finally { $('confirm-report').disabled = false; message(''); }
}
document.addEventListener('DOMContentLoaded', () => {
  $('request-location').addEventListener('click', getLocation); $('retry-location').addEventListener('click', getLocation);
  $('review-report').addEventListener('click', review); $('edit-report').addEventListener('click', () => { draft.edit(); show('details-step'); });
  $('confirm-report').addEventListener('click', confirm); $('retry-submission').addEventListener('click', confirm);
  document.querySelectorAll('.cancel-report').forEach(button => button.addEventListener('click', reset));
});
