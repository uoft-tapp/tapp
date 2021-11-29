import { createSelector } from "reselect";
import {
    applicantsReducer,
    applicationsReducer,
    assignmentsReducer,
    contractTemplatesReducer,
    ddahsReducer,
    instructorsReducer,
    instructorPreferencesReducer,
    positionsReducer,
    postingsReducer,
    sessionsReducer,
} from "../reducers";

/**
 * Given a selector that returns the local store, create a memoized selector
 * that returns the `_modelData` from the store.
 */
function makeModelDataSelector<T>(
    selector: (state: any, ...params: any[]) => { _modelData: T }
) {
    return createSelector(selector, (state) => state._modelData);
}

/**
 * When an API call is made, the raw data returned by the backend is stored. That data is recombined
 * in various ways by other selectors, as needed by the UI. These selectors directly access the raw data.
 *
 * In order to get at the raw data, we use the `_localStorSelector`, which is created whenever we create a
 * reducer. The `_localStoreSelector` intelligently searches for and returns the relevant portion of the
 * store. This is not a standard redux function.
 */
export const rawSelector = {
    applicants: makeModelDataSelector(applicantsReducer._localStoreSelector),
    applications: makeModelDataSelector(
        applicationsReducer._localStoreSelector
    ),
    assignments: makeModelDataSelector(assignmentsReducer._localStoreSelector),
    contractTemplates: makeModelDataSelector(
        contractTemplatesReducer._localStoreSelector
    ),
    ddahs: makeModelDataSelector(ddahsReducer._localStoreSelector),
    instructorPreferences: makeModelDataSelector(
        instructorPreferencesReducer._localStoreSelector
    ),
    instructors: makeModelDataSelector(instructorsReducer._localStoreSelector),
    positions: makeModelDataSelector(positionsReducer._localStoreSelector),
    postings: makeModelDataSelector(postingsReducer._localStoreSelector),
    session: makeModelDataSelector(sessionsReducer._localStoreSelector),
};
