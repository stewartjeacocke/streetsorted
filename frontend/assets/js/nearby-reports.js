export const NearbyStates = Object.freeze({
  LOADING: "loading",
  FOUND: "reports-found",
  EMPTY: "no-results",
  UNAVAILABLE: "unavailable",
  MATCH: "match",
  NO_MATCH: "no-match",
});
export function createNearbyState() {
  let state = null;
  let reports = [];
  return {
    get state() {
      return state;
    },
    get reports() {
      return reports;
    },
    loading() {
      state = NearbyStates.LOADING;
      reports = [];
    },
    found(items) {
      state = items.length ? NearbyStates.FOUND : NearbyStates.EMPTY;
      reports = items;
    },
    unavailable() {
      state = NearbyStates.UNAVAILABLE;
      reports = [];
    },
    decide(value) {
      state = value;
    },
    discard() {
      state = null;
      reports = [];
    },
  };
}
