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
import { fetchApplicants, fetchApplicantsSuccess } from "./applicants";
import { fetchApplications, fetchApplicationsSuccess } from "./applications";
import { fetchAssignments, fetchAssignmentsSuccess } from "./assignments";
import {
    fetchContractTemplates,
    fetchContractTemplatesSuccess,
} from "./contract_templates";
import { fetchInstructors, fetchInstructorsSuccess } from "./instructors";
import { fetchPositions, fetchPositionsSuccess } from "./positions";
import { setGlobals, globalsSelector } from "./globals";
import { parseURLSearchString } from "../../libs/urls";
import { fetchDdahs } from "./ddahs";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../../rootReducer";
import { AnyAction } from "redux";
import {
    fetchInstructorPreferences,
    fetchInstructorPreferencesSuccess,
} from "./instructor_preferences";

type InitStages =
    | "pageLoad"
    | "toggleMockAPI"
    | "setActiveUser"
    | "setActiveUserRole"
    | "fetchInstructors"
    | "fetchSessions"
    | "setActiveSession"
    | "updateGlobals"
    | "fetchSessionDependentData";

/**
 * A helper function to replace all API actions to
 * use mock API actions.
 *
 * @param {boolean} enableMockAPI
 */
function toggleMockApi(enableMockAPI: boolean) {
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
 * @param globals
 * @returns same as input but with `null` values removed.
 */
function prepareGlobals<T extends Record<string, string | number | null>>(
    globals: T
) {
    const ret: Record<string, string | number> = {};
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
 * @param stage - What stage to start the init procedure at
 * @param options - if true, start from the stage following the specified stage; if false, start from the specified stage
 * @returns an async function that handles all the API calls.
 */
export function initFromStage(
    stage: InitStages,
    options = { startAfterStage: false }
): ThunkAction<Promise<void>, RootState, void, AnyAction> {
    const startAfterStage = options.startAfterStage ? 1 : 0;

    return async (dispatch, getState) => {
        const parsedGlobals = {
            mockAPI: null,
            activeSession: null,
            role: null,
        };

        // These actions don't need to finish in a specific order,
        // so we can wait for them to finish at the end of this function to speed up startup.
        const asyncActions = [];

        /**
         * A helper function to determine if the `currentStage`
         * should be run
         *
         * @param queryStage
         * @returns whether the `currentStage` action should be performed
         */
        function shouldRunStage(queryStage: InitStages) {
            const initOrder: InitStages[] = [
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
            // When the role is changed, data should be cleared immediately.
            // It will be re-fetched via the appropriate routes.
            dispatch(clearSessionDependentData());
            dispatch(fetchInstructorsSuccess([]));

            const activeRole = activeRoleSelector(getState());
            await dispatch(setActiveUserRole(activeRole, { skipInit: true }));
        }

        if (shouldRunStage("fetchInstructors")) {
            // Even though we eventually catch all the errors when we await the asyncActions,
            // sometimes an error is thrown before we have a chance to await it. React,
            // in dev mode, watches for any uncaught errors in promises and will refuse to
            // render the interface if there are any. For that reason, we set this promise
            // up with a catch block right away.
            asyncActions.push(dispatch(fetchInstructors()).catch(console.log));
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
            // Before fetching session-related data, the existing data
            // should be cleared. It will be re-fetched via the appropriate routes,
            // but clearing now will prevent excess re-renders as data streams in.
            await dispatch(clearSessionDependentData());

            // `fetchActions` array contains all the fetch API calls that need to be
            // made in order to obtain all data that the app needs.
            const fetchActions = [
                fetchContractTemplates,
                fetchApplicants,
                fetchPositions,
                fetchApplications,
                fetchAssignments,
                fetchDdahs,
                fetchInstructorPreferences,
            ];

            // The order of fetching here doesn't matter, so dispatch all at once
            await Promise.all(
                fetchActions.map((action) => dispatch(action() as any))
            );
        }

        // Wait for async actions dispatched earlier to complete.
        await Promise.all(asyncActions);
    };
}

/**
 * Clear all session-specific store data: applicants, assignments,
 * contract templates, applications, and positions.
 *
 * @export
 * @returns an async function that handles all the API calls.
 */
export function clearSessionDependentData(): ThunkAction<
    Promise<void>,
    RootState,
    void,
    AnyAction
> {
    return async (dispatch) => {
        dispatch(fetchInstructorPreferencesSuccess([]));
        dispatch(fetchApplicantsSuccess([]));
        dispatch(fetchAssignmentsSuccess([]));
        dispatch(fetchContractTemplatesSuccess([]));
        dispatch(fetchApplicationsSuccess([]));
        dispatch(fetchPositionsSuccess([]));
    };
}
