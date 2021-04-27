import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    validatedApiDispatcher,
    arrayToHash,
    flattenIdFactory,
    HasId,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { positionsReducer } from "../reducers/positions";
import { createSelector } from "reselect";
import { instructorsSelector } from "./instructors";
import { contractTemplatesSelector } from "./contract_templates";
import { activeRoleSelector } from "./users";
import { Position, RawPosition } from "../defs/types";
import { activeSessionSelector } from "./sessions";
import { ExportFormat, PrepareDataFunc } from "../../libs/import-export";

// actions
export const fetchPositionsSuccess = actionFactory<RawPosition[]>(
    FETCH_POSITIONS_SUCCESS
);
const fetchOnePositionSuccess = actionFactory<RawPosition>(
    FETCH_ONE_POSITION_SUCCESS
);
const upsertOnePositionSuccess = actionFactory<RawPosition>(
    UPSERT_ONE_POSITION_SUCCESS
);
const deleteOnePositionSuccess = actionFactory<RawPosition>(
    DELETE_ONE_POSITION_SUCCESS
);

const MissingActiveSessionError = new Error(
    "Cannot interact with Positions without an active session"
);

// dispatchers
export const fetchPositions = validatedApiDispatcher({
    name: "fetchPositions",
    description: "Fetch positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw MissingActiveSessionError;
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/positions`
        )) as RawPosition[];
        dispatch(fetchPositionsSuccess(data));
    },
});

export const fetchPosition = validatedApiDispatcher({
    name: "fetchPosition",
    description: "Fetch position",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw MissingActiveSessionError;
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/positions/${payload.id}`
        )) as RawPosition;
        dispatch(fetchOnePositionSuccess(data));
    },
});

// Some helper functions to convert the data that the UI uses
// into data that the API can use
const instructorsToInstructorIds = flattenIdFactory<
    "instructors",
    "instructor_ids"
>("instructors", "instructor_ids");
const contractTemplateToContractTemplateId = flattenIdFactory<
    "contract_template",
    "contract_template_id"
>("contract_template", "contract_template_id");

function prepForApi(data: Partial<Position>) {
    return contractTemplateToContractTemplateId(
        instructorsToInstructorIds(data)
    ) as Partial<RawPosition>;
}

export const upsertPosition = validatedApiDispatcher({
    name: "upsertPosition",
    description: "Add/insert position",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<Position>) => async (dispatch, getState) => {
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw MissingActiveSessionError;
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/sessions/${activeSessionId}/positions`,
            prepForApi(payload)
        )) as RawPosition;
        dispatch(upsertOnePositionSuccess(data));
        return data;
    },
});

export const deletePosition = validatedApiDispatcher({
    name: "deletePosition",
    description: "Delete position",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/positions/delete`,
            prepForApi(payload)
        )) as RawPosition;
        dispatch(deleteOnePositionSuccess(data));
    },
});

export const exportPositions = validatedApiDispatcher({
    name: "exportPositions",
    description: "Export positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (
        formatter: PrepareDataFunc<Position>,
        format: ExportFormat = "spreadsheet"
    ) => async (dispatch, getState) => {
        if (!(formatter instanceof Function)) {
            throw new Error(
                `"formatter" must be a function when using the export action.`
            );
        }
        // Re-fetch all positions from the server in case things happened to be out of sync.
        await dispatch(fetchPositions());
        const positions = positionsSelector(getState());

        return formatter(positions, format);
    },
});

export const upsertPositions = validatedApiDispatcher({
    name: "upsertPositions",
    description: "Upsert a list of positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (positions: Partial<Position>[]) => async (dispatch) => {
        if (positions.length === 0) {
            return;
        }
        const dispatchers = positions.map((position) =>
            dispatch(upsertPosition(position))
        );
        await Promise.all(dispatchers);
        // Re-fetch all positions from the server in case things happened to be out of sync.
        await dispatch(fetchPositions());
    },
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
const localStoreSelector = positionsReducer._localStoreSelector;
const _positionsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
/**
 * Get the positions, but populate the `instructors` array with the full instructor
 * information.
 */
export const positionsSelector = createSelector(
    [_positionsSelector, instructorsSelector, contractTemplatesSelector],
    (positions, instructors, contractTemplates) => {
        // Hash the instructors by `id` for fast lookup
        const instructorsById = arrayToHash(instructors);
        const contractTemplatesById = arrayToHash(contractTemplates);

        // Leave all the data alone, except replace the `instructor_ids` list
        // with the full instructor data.
        return positions.map(
            ({ instructor_ids, contract_template_id, ...rest }) => ({
                ...rest,
                // When the instructor list references an instructor that we haven't loaded
                // we don't want the frontend to crash, so filter out any null instructors
                instructors: instructor_ids
                    .map((x) => instructorsById[x])
                    .filter((x) => x),
                contract_template: contractTemplatesById[contract_template_id],
            })
        ) as Position[];
    }
);
