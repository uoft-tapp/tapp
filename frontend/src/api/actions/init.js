import { setActiveSession, fetchSessions, sessionsSelector } from "./sessions";
import { fetchActiveUser, setActiveUserRole } from "./users";
import { fetchApplicants } from "./applicants";
import { fetchApplications } from "./applications";
import { fetchAssignments } from "./assignments";
import { fetchContractTemplates } from "./contract_templates";
import { fetchInstructors } from "./instructors";
import { fetchPositions } from "./positions";
import { setGlobals, globalsSelector } from "./globals";

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
 * A helper function to update all necessary global variables
 *
 * @param {bool} enableMockAPI
 * @param {object} newActiveSession
 * @param {function} getState
 * @returns
 */
function updateGlobals(enableMockAPI, newActiveSession, getState) {
    const state = getState();
    let globals = globalsSelector(state);

    if (enableMockAPI != null) {
        globals = {
            ...globals,
            mockAPI: enableMockAPI
        };
    }

    if (newActiveSession) {
        globals = {
            ...globals,
            activeSession: newActiveSession.id
        };
    }

    return setGlobals(globals);
}

/**
 * The old way this is used to work is that after component mounted
 * actions that needs to be made asynchronously are executed in
 * `componentDidMount` of `App.js`, but leaving the `toggleMockAPI`
 * controlled by the mockAPI component.
 * However, this leads to a racing condition such that when mockAPI
 * should be turned on, the toggling action does not occur before all
 * the API calls are made. Hence the app is trying to fetch from the real
 * API instead of the mock API.
 * In addition, on the event of turning on and off the mock API, switching
 * active user role and setting active sessions, a similar consecutive API
 * actions are made comparing to the initialization.
 *
 * The new approach is to make each actions in `iniOrder` array, which
 * contains all the consecutive API actions that need to be made on
 * application load, as a stage, and move the actual toggling of the mock
 * API to this level instead of leaving it to the mockAPI component. Whenever
 * a related events occur (for example, changing active session), the action
 * creator will call this `initFromStage` action with the matching stage and
 * this function will perform different API actions that is necessary
 * after the specified `stage`
 *
 * @export
 * @param {string} stage
 * @param {object} options
 * @returns {function} an async function that handles all the API calls.
 */
export function initFromStage(stage, options) {
    return async (dispatch, getState) => {
        const {
            activeSession = null,
            activeUserRole = "admin",
            mockAPI = null
        } = options;

        /**
         * A helper function to determine if the `currentStage`
         * should be run
         *
         * @param {string} currentStage
         * @returns {boolean} whether the `currentStage` action
         * should be performed
         */
        const shouldRunStage = currentStage => {
            const initOrder = [
                "toggleMockAPI",
                "setActiveUser",
                "setActiveUserRole",
                "fetchSessions",
                "setActiveSession",
                "updateGlobals"
            ];

            const startIndex = initOrder.indexOf(stage);

            return startIndex <= initOrder.indexOf(currentStage);
        };

        if (shouldRunStage("toggleMockAPI")) {
            toggleMockApi(mockAPI);
        }

        if (shouldRunStage("setActiveUser")) {
            await dispatch(fetchActiveUser());
        }

        if (shouldRunStage("setActiveUserRole")) {
            await dispatch(setActiveUserRole(activeUserRole));
        }

        if (shouldRunStage("fetchSessions")) {
            await dispatch(fetchSessions());
        }

        if (shouldRunStage("setActiveSession") && activeSession !== null) {
            // after sessions are fetched, we compare with the active session.
            // The active session might need to be "updated" if the ID matches but
            // the data doesn't
            const state = getState();
            const sessions = sessionsSelector(state);
            const matchingSession =
                sessions.filter(s => s.id === activeSession.id)[0] ||
                activeSession;

            await dispatch(setActiveSession(matchingSession));
        }

        if (shouldRunStage("updateGlobals")) {
            await dispatch(updateGlobals(mockAPI, activeSession, getState));
        }

        const promises = [];

        // `fetchActions` array contains all the fetch API calls that need to be
        // made in order to obtain all data that the app needs. Each action would
        // be execute and dispatch later in the `fetchActions.map`.
        const fetchActions = [
            fetchApplicants,
            fetchApplications,
            fetchAssignments,
            fetchContractTemplates,
            fetchInstructors,
            fetchPositions
        ];

        fetchActions.map(action => dispatch(action()));
        await Promise.all(promises);
    };
}
