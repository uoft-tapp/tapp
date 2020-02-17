import { validatedApiDispatcher } from "./utils";
import { apiError } from "./errors";
import { activeSessionSelector } from "./sessions";
import { initFromStage } from "./init";

export const setGlobals = validatedApiDispatcher({
    name: "setGlobals",
    description: "Sets global variables",
    onErrorDispatch: e => apiError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const globals = { ...globalsSelector(getState()), ...payload };

        // Store the globals in the URL
        await dispatch(setGlobalsInUrl(globals));

        // Now store the globals in the Redux store
        dispatch({ type: "SET_GLOBALS", payload: globals });
    }
});

/**
 * Sets the specified values to be part of the URL
 */
export const setGlobalsInUrl = validatedApiDispatcher({
    name: "setGlobalsInUrl",
    description: "Stores global variables in the URL",
    onErrorDispatch: e => apiError(e.toString()),
    dispatcher: payload => async () => {
        // Create a new URL with the globals set in it
        const searchParams = new URLSearchParams();
        for (const [key, val] of Object.entries(payload)) {
            searchParams.append(key, JSON.stringify(val));
        }

        // If we have globals to store, push them onto the url
        if (window.history.pushState && ("" + searchParams).length > 0) {
            let newUrl = new URL(window.location);
            newUrl.search = "?" + searchParams;
            newUrl = "" + newUrl;
            if ("" + newUrl !== "" + window.location) {
                window.history.pushState({ path: newUrl }, "", newUrl);
            }
        }
    }
});

export const setMockAPIState = validatedApiDispatcher({
    name: "setMockAPIState",
    description: "Activates or deactivates the mockAPI",
    onErrorDispatch: e => apiError(e.toString()),
    dispatcher: (payload, options = { skipInit: false }) => async dispatch => {
        await dispatch(setGlobals({ mockAPI: payload }));

        if (!options.skipInit) {
            await dispatch(initFromStage("toggleMockAPI"));
        }
    }
});

export const globalsSelector = state => {
    // Peel off the `activeSession` if it is stored in globals.
    // We want to always use the "real" active session and want
    // to avoid multiple sources of truth.
    // eslint-disable-next-line
    const { activeSession, ...otherGlobals } = state.ui.globals;
    const storedActiveSession = activeSessionSelector(state);
    if (storedActiveSession != null && storedActiveSession.id != null) {
        return { ...otherGlobals, activeSession: storedActiveSession.id };
    }
    return otherGlobals;
};
