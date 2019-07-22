//import PropTypes from "prop-types";
import {
    FETCH_OFFERS_SUCCESS
} from "../constants";
import { fetchError} from "./errors";
//import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher
} from "./utils";
import { apiGET } from "../../libs/apiUtils";
//import { apiGET, apiPOST } from "../../libs/apiUtils";
import { offersReducer } from "../reducers/offers";
import { createSelector } from "reselect";

// actions
const fetchOffersSuccess = actionFactory(FETCH_OFFERS_SUCCESS);

// dispatchers
export const fetchOffers = validatedApiDispatcher({
    name: "fetchOffers",
    description: "Fetch Offers",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(`/sessions/${activeSessionId}/offers`);
        dispatch(fetchOffersSuccess(data));
    }
});


// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = offersReducer._localStoreSelector;
export const offersSelector = createSelector(
    localStoreSelector,
    state => state._modelData
);

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchOffers);
