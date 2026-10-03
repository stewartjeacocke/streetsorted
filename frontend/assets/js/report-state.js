export const States = Object.freeze({
  LOCATION_REQUIRED: 'location-required', DETAILS: 'details-in-progress', REVIEW: 'review',
  SUBMITTING: 'submitting', CONFIRMED: 'confirmed', UNCONFIRMED: 'unconfirmed', FAILED: 'failed'
});

export function createReportState() {
  let state = States.LOCATION_REQUIRED;
  let location = null;
  let description = '';
  return {
    get state() { return state; }, get location() { return location; }, get description() { return description; },
    setLocation(value) { location = value; state = States.DETAILS; },
    setDescription(value) { description = value; },
    review() { state = States.REVIEW; }, submitting() { state = States.SUBMITTING; },
    outcome(value) { state = value; }, edit() { state = States.DETAILS; },
    discard() { state = States.LOCATION_REQUIRED; location = null; description = ''; }
  };
}
