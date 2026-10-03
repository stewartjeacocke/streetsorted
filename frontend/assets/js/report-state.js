export const States = Object.freeze({
  LOCATION_REQUIRED: "location-required",
  NEARBY_LOADING: "nearby-loading",
  NEARBY_FOUND: "nearby-found",
  NEARBY_UNAVAILABLE: "nearby-unavailable",
  DETAILS: "details-in-progress",
  REVIEW: "review",
  SUBMITTING: "submitting",
  CONFIRMED: "confirmed",
  UNCONFIRMED: "unconfirmed",
  FAILED: "failed",
  STOPPED: "stopped",
});
export function createReportState() {
  let state = States.LOCATION_REQUIRED;
  let location = null;
  let description = "";
  return {
    get state() {
      return state;
    },
    get location() {
      return location;
    },
    get description() {
      return description;
    },
    setLocation(value) {
      location = value;
      state = States.NEARBY_LOADING;
    },
    nearbyFound() {
      state = States.NEARBY_FOUND;
    },
    nearbyUnavailable() {
      state = States.NEARBY_UNAVAILABLE;
    },
    continueAfterNearby() {
      state = States.DETAILS;
    },
    setDescription(value) {
      description = value;
    },
    review() {
      state = States.REVIEW;
    },
    submitting() {
      state = States.SUBMITTING;
    },
    outcome(value) {
      state = value;
    },
    edit() {
      state = States.DETAILS;
    },
    discard() {
      state = States.LOCATION_REQUIRED;
      location = null;
      description = "";
    },
  };
}
