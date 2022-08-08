import { RootState } from "../../../rootReducer";
import {
    UPSERT_MATCH,
    BATCH_UPSERT_MATCHES,
    UPSERT_GUARANTEE,
    BATCH_UPSERT_GUARANTEES,
    UPSERT_NOTE,
    BATCH_UPSERT_NOTES,
    SET_SELECTED_POSITION,
    SET_VIEW_TYPE,
    SET_UPDATED,
} from "./constants";
import { Match, AppointmentGuaranteeStatus, ViewType } from "./types";
import { actionFactory } from "../../../api/actions/utils";

// actions
export const upsertMatch = actionFactory<Match>(UPSERT_MATCH);

export const batchUpsertMatches = actionFactory<Match[]>(BATCH_UPSERT_MATCHES);

export const upsertGuarantee =
    actionFactory<AppointmentGuaranteeStatus>(UPSERT_GUARANTEE);

export const batchUpsertGuarantees = actionFactory<
    AppointmentGuaranteeStatus[]
>(BATCH_UPSERT_GUARANTEES);

export const upsertNote =
    actionFactory<Record<string, string | null>>(UPSERT_NOTE);

export const batchUpsertNotes =
    actionFactory<Record<string, string | null>>(BATCH_UPSERT_NOTES);

export const setSelectedPosition = actionFactory<number | null>(
    SET_SELECTED_POSITION
);

export const setViewType = actionFactory<ViewType>(SET_VIEW_TYPE);

export const setUpdated = actionFactory<boolean>(SET_UPDATED);

// selectors
export const matchingDataSelector = (state: RootState) => state.ui.matchingData;
export const matchesSelector = (state: RootState) =>
    state.ui.matchingData.matches;
export const guaranteesSelector = (state: RootState) =>
    state.ui.matchingData.guarantees;
export const notesSelector = (state: RootState) => state.ui.matchingData.notes;
export const selectedPositionSelector = (state: RootState) =>
    state.ui.matchingData.selectedPositionId;
export const viewTypeSelector = (state: RootState) =>
    state.ui.matchingData.viewType;
export const updatedSelector = (state: RootState) =>
    state.ui.matchingData.updated;
