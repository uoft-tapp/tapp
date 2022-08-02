import { RootState } from "../../../rootReducer";
import {
    UPSERT_MATCH,
    BATCH_UPSERT_MATCHES,
    UPSERT_GUARANTEE,
    BATCH_UPSERT_GUARANTEES,
    UPSERT_NOTE,
    BATCH_UPSERT_NOTES,
} from "./constants";
import { Match, AppointmentGuaranteeStatus } from "./types";

// actions
export const upsertMatch = (data: Match) => ({
    type: UPSERT_MATCH,
    payload: data,
});

export const batchUpsertMatches = (data: Match[]) => ({
    type: BATCH_UPSERT_MATCHES,
    payload: data,
});

export const upsertGuarantee = (data: AppointmentGuaranteeStatus) => ({
    type: UPSERT_GUARANTEE,
    payload: data,
});

export const batchUpsertGuarantees = (data: AppointmentGuaranteeStatus[]) => ({
    type: BATCH_UPSERT_GUARANTEES,
    payload: data,
});

export const upsertNote = (data: Record<string, string | null>) => ({
    type: UPSERT_NOTE,
    payload: data,
});

export const batchUpsertNotes = (data: Record<string, string | null>) => ({
    type: BATCH_UPSERT_NOTES,
    payload: data,
});

// selectors
export const matchingDataSelector = (state: RootState) => state.ui.matchingData;
export const matchesSelector = (state: RootState) =>
    state.ui.matchingData.matches;
export const guaranteesSelector = (state: RootState) =>
    state.ui.matchingData.guarantees;
export const notesSelector = (state: RootState) => state.ui.matchingData.notes;
