import { RootState } from "../../../rootReducer";
import { UPSERT_MATCH, BATCH_UPSERT_MATCHES } from "./constants";
import { Match } from "./types";

// actions
export const upsertMatch = (data: Match) => ({
    type: UPSERT_MATCH,
    payload: data,
});

export const batchUpsertMatches = (data: Match[]) => ({
    type: BATCH_UPSERT_MATCHES,
    payload: data
})

// selectors
export const matchingDataSelector = (state: RootState) => state.ui.matchingData;
export const matchesSelector = (state: RootState) => state.ui.matchingData.matches;
export const guaranteesSelector = (state: RootState) => state.ui.matchingData.guarantees;