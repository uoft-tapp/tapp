import {
    setActiveSession,
    fetchSessions,
    sessionsSelector,
    activeSessionSelector,
} from "./sessions";
import {
    fetchActiveUser,
    setActiveUserRole,
    activeRoleSelector,
} from "./users";
import { fetchApplicants } from "./applicants";
import { fetchApplications } from "./applications";
import { fetchAssignments } from "./assignments";
import { fetchContractTemplates } from "./contract_templates";
import { fetchInstructors } from "./instructors";
import { fetchPositions } from "./positions";
import { setGlobals, globalsSelector } from "./globals";
import { parseURLSearchString } from "../../libs/urlUtils";
import { fetchDdahs } from "./ddahs";

/**
 * A helper function to replace all API actions to
 * use mock API actions.
 *
 * @param {boolean} enableMockAPI
 */
function toggleMockApi(enableMockAPI) {
    // in production, ToggleMockApi is a no-op. In development, it actually
    // does something.
    /* eslint-disable */
    if (enableMockAPI != null && process.env.REACT_APP_DEV_FEATURES) {
        const mock = require("../mockAPI");
        const mockAPI = mock.mockAPI;

        if (enableMockAPI === true) {
            mockAPI.replaceGlobalFetch();
        } else {
            mockAPI.restoreGlobalFetch();
        }
    }
    /* eslint-enable */
}

/**
 * Prepare an object to be used to set global variables. The
 * return value is the same as the input except with `null` entries
 * removed.
 *
 * @param {*} globals
 * @returns {object} same as input but with `null` values removed.
 */
function prepareGlobals(globals) {
    const ret = {};
    for (const [key, val] of Object.entries(globals)) {
        if (val != null) {
            ret[key] = val;
        }
    }
    return ret;
}

/**
 * Various actions have side effects, requiring additional actions to
 * be dispatched. For example, if a session changes, all data related to
 * that session needs to be re-fetched.
 *
 * This function allows you to specify "stage" to start the init procedure at.
 * It will handle re-fetching any dependent data and dispatching any
 * required actions depending on the stage specified.
 *
 * @export
 * @param {string} stage - What stage to start the init procedure at
 * @param {{ startAfterStage: boolean }} options - if true, start from the stage following the specified stage; if false, start from the specified stage
 * @returns {function} an async function that handles all the API calls.
 */
export function initFromStage(stage, options = { startAfterStage: false }) {
    const startAfterStage = !!options.startAfterStage;

    return async (dispatch, getState) => {
        const parsedGlobals = { mockAPI: null, activeSession: null };

        // These actions don't need to finish in a specific order,
        // so we can wait for them to finish at the end of this function to speed up startup.
        const asyncActions = [];

        /**
         * A helper function to determine if the `currentStage`
         * should be run
         *
         * @param {string} queryStage
         * @returns {boolean} whether the `currentStage` action
         * should be performed
         */
        function shouldRunStage(queryStage) {
            const initOrder = [
                "pageLoad",
                "toggleMockAPI",
                "setActiveUser",
                "setActiveUserRole",
                "fetchInstructors",
                "fetchSessions",
                "setActiveSession",
                "updateGlobals",
                "fetchSessionDependentData",
            ];

            // Is the queried stage dependent on the current stage?
            // If `startAfterStage` is set, we actually want to know
            // if we are the *next* stage.
            const stageDependent =
                initOrder.indexOf(stage) + startAfterStage <=
                initOrder.indexOf(queryStage);

            // `"setActiveSession" requires that an active session be set before
            // it gets run.
            if (stageDependent && queryStage === "setActiveSession") {
                const state = getState();
                const sessions = sessionsSelector(state);
                const activeSession = activeSessionSelector(state) || {
                    id: parsedGlobals.activeSession,
                };
                return sessions.find(
                    (session) => session.id === activeSession.id
                );
            }

            // All session dependent data depends on an active session being set
            if (stageDependent && queryStage === "fetchSessionDependentData") {
                const state = getState();
                const activeSession = activeSessionSelector(state);
                return activeSession?.id != null;
            }

            return stageDependent;
        }

        if (shouldRunStage("pageLoad")) {
            // When the page loads we parse the URL and pull out any globals that
            // need setting
            if (window.location) {
                Object.assign(
                    parsedGlobals,
                    parseURLSearchString(window.location.search)
                );
                // Immediately set any global variables in the Redux store.
                await dispatch(setGlobals(prepareGlobals(parsedGlobals)));
            }
        }

        if (shouldRunStage("toggleMockAPI")) {
            const globals = globalsSelector(getState());
            toggleMockApi(globals.mockAPI);
        }

        if (shouldRunStage("setActiveUser")) {
            await dispatch(fetchActiveUser());
        }

        if (shouldRunStage("setActiveUserRole")) {
            const activeRole = activeRoleSelector(getState());
            await dispatch(setActiveUserRole(activeRole, { skipInit: true }));
        }

        if (shouldRunStage("fetchInstructors")) {
            asyncActions.push(dispatch(fetchInstructors()));
        }

        if (shouldRunStage("fetchSessions")) {
            await dispatch(fetchSessions());
        }

        if (shouldRunStage("setActiveSession")) {
            // after sessions are fetched, we compare with the active session.
            // The active session might need to be "updated" if the ID matches but
            // the data doesn't
            const state = getState();
            const sessions = sessionsSelector(state);
            const activeSession = activeSessionSelector(state);
            // There are two places where the active session could be store:
            // in the URL as a global and in the Redux store. Prefer the value
            // in the URL.
            const matchingSession =
                sessions.find(
                    (session) => session.id === parsedGlobals.activeSession
                ) || activeSession;

            await dispatch(
                setActiveSession(matchingSession, { skipInit: true })
            );
        }

        if (shouldRunStage("updateGlobals")) {
            await dispatch(setGlobals(prepareGlobals(parsedGlobals)));
        }

        if (shouldRunStage("fetchSessionDependentData")) {
            // `fetchActions` array contains all the fetch API calls that need to be
            // made in order to obtain all data that the app needs.
            const fetchActions = [
                fetchApplicants,
                fetchApplications,
                fetchAssignments,
                fetchContractTemplates,
                fetchPositions,
                fetchDdahs,
            ];

            // The order of fetching here doesn't matter, so dispatch all at once
            await Promise.all(fetchActions.map((action) => dispatch(action())));
        }

        // Wait for async actions dispatched earlier to complete.
        await Promise.all(asyncActions);
    };
}
