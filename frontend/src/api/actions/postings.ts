import { createSelector } from "reselect";
import {
    FETCH_POSTINGS_SUCCESS,
    FETCH_ONE_POSTING_SUCCESS,
    UPSERT_ONE_POSTING_SUCCESS,
    DELETE_ONE_POSTING_SUCCESS,
    FETCH_POSTING_POSITIONS_SUCCESS,
    FETCH_ONE_POSTING_POSITION_SUCCESS,
    UPSERT_ONE_POSTING_POSITION_SUCCESS,
    DELETE_ONE_POSTING_POSITION_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    HasId,
    splitObjByProps,
    validatedApiDispatcher,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { postingsReducer } from "../reducers/postings";
import { activeRoleSelector } from "./users";
import { postingPositionsReducer } from "../reducers/posting_positions";
import type {
    Position,
    Posting,
    PostingPosition,
    RawPosting,
    RawPostingPosition,
    RequireSome,
} from "../defs/types";
import { positionsSelector } from "./positions";
import { ExportFormat } from "../../libs/import-export";

// actions
export const fetchPostingsSuccess = actionFactory<RawPosting[]>(
    FETCH_POSTINGS_SUCCESS
);
const fetchOnePostingSuccess = actionFactory<RawPosting>(
    FETCH_ONE_POSTING_SUCCESS
);
const upsertOnePostingSuccess = actionFactory<RawPosting>(
    UPSERT_ONE_POSTING_SUCCESS
);
const deleteOnePostingSuccess = actionFactory<RawPosting>(
    DELETE_ONE_POSTING_SUCCESS
);

// PostingPosition actions
export const fetchPostingPositionsSuccess = actionFactory<RawPostingPosition[]>(
    FETCH_POSTING_POSITIONS_SUCCESS
);
const fetchOnePostingPositionSuccess = actionFactory<RawPostingPosition>(
    FETCH_ONE_POSTING_POSITION_SUCCESS
);
const upsertOnePostingPositionSuccess = actionFactory<RawPostingPosition>(
    UPSERT_ONE_POSTING_POSITION_SUCCESS
);
const deleteOnePostingPositionSuccess = actionFactory<RawPostingPosition>(
    DELETE_ONE_POSTING_POSITION_SUCCESS
);

// dispatchers
export const fetchPostings = validatedApiDispatcher({
    name: "fetchPostings",
    description: "Fetch postings",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error("Cannot fetch Postings without an active session");
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/postings` as const
        );
        dispatch(fetchPostingsSuccess(data));
        return data;
    },
});

export const fetchPosting = validatedApiDispatcher({
    name: "fetchPosting",
    description: "Fetch posting",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/postings/${payload.id}`
        )) as RawPosting;
        dispatch(fetchOnePostingSuccess(data));
        return data;
    },
});

function prepPostingForApi(posting: Partial<Posting>): Partial<RawPosting> {
    // eslint warns about unused variables by default. We want to ignore that warning in this case.
    // eslint-disable-next-line
    const [ret, _rest] = splitObjByProps(posting, [
        "posting_positions",
        "applications",
    ]);
    return ret;
}

export const upsertPosting = validatedApiDispatcher({
    name: "upsertPosting",
    description: "Add/insert posting",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher:
        (payload: Partial<RawPosting> | Partial<Posting>) =>
        async (dispatch, getState) => {
            const role = activeRoleSelector(getState());
            const activeSession = getState().model.sessions.activeSession;
            if (activeSession == null) {
                throw new Error(
                    "Cannot fetch Postings without an active session"
                );
            }
            const { id: activeSessionId } = activeSession;
            const data = (await apiPOST(
                `/${role}/sessions/${activeSessionId}/postings`,
                prepPostingForApi(payload)
            )) as RawPosting;
            dispatch(upsertOnePostingSuccess(data));

            // If there are posting_positions included with the posting, upsert them too
            const posting_positions = (payload as Partial<Posting>)
                .posting_positions;
            if (Array.isArray(posting_positions)) {
                const posting_id = data.id;
                await Promise.all(
                    posting_positions.map((postingPosition) =>
                        dispatch(
                            upsertPostingPosition({
                                ...postingPosition,
                                // Since we may be upserting into a newly-created posting, the supplied data
                                // might not have the posting id. Insert it just to be sure it's there.
                                posting_id,
                                posting: {
                                    ...postingPosition.posting,
                                    id: posting_id,
                                },
                            })
                        )
                    )
                );
                // TODO: we currently don't check to see if there are any PostingPositions that we should delete.
            }
            return data;
        },
});

export const deletePosting = validatedApiDispatcher({
    name: "deletePosting",
    description: "Delete posting",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/postings/delete`,
            payload
        )) as RawPosting;
        dispatch(deleteOnePostingSuccess(data));
    },
});

export const fetchSurvey = validatedApiDispatcher({
    name: "fetchSurvey",
    description: "Fetch the survey associated with a posting",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (_dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/postings/${payload.id}/survey`
        )) as any;
        return data;
    },
});

// PostingPosition dispatchers
export const fetchPostingPositions = validatedApiDispatcher({
    name: "fetchPostingPositions",
    description: "Fetch posting_positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error(
                "Cannot fetch PostingPositions without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/posting_positions`
        )) as RawPostingPosition[];
        dispatch(fetchPostingPositionsSuccess(data));
        return data;
    },
});

export const fetchPostingPositionsForPosting = validatedApiDispatcher({
    name: "fetchPostingPositionsForPosting",
    description: "Fetch posting_positions for a particular posting",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (posting: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/postings/${posting.id}/posting_positions`
        )) as RawPostingPosition[];
        dispatch(fetchPostingPositionsSuccess(data));
        return data;
    },
});

export const fetchPostingPosition = validatedApiDispatcher({
    name: "fetchPostingPosition",
    description: "Fetch posting_position",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/posting_positions/${payload.id}`
        )) as RawPostingPosition;
        dispatch(fetchOnePostingPositionSuccess(data));
        return data;
    },
});

export const upsertPostingPosition = validatedApiDispatcher({
    name: "upsertPostingPosition",
    description: "Add/insert posting_position",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher:
        (
            payload:
                | RequireSome<RawPostingPosition, "position_id" | "posting_id">
                | RequireSome<PostingPosition, "position" | "posting">
        ) =>
        async (dispatch, getState) => {
            const rawPostingPosition = prepPostingPositionForApi(payload);
            const role = activeRoleSelector(getState());
            const data = (await apiPOST(
                `/${role}/posting_positions`,
                rawPostingPosition
            )) as RawPostingPosition;
            dispatch(upsertOnePostingPositionSuccess(data));
            return data;
        },
});

export const deletePostingPosition = validatedApiDispatcher({
    name: "deletePostingPosition",
    description: "Delete posting_position",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher:
        (
            payload:
                | RequireSome<RawPostingPosition, "position_id" | "posting_id">
                | RequireSome<PostingPosition, "position" | "posting">
        ) =>
        async (dispatch, getState) => {
            const rawPostingPosition = prepPostingPositionForApi(payload);
            const role = activeRoleSelector(getState());
            const data = (await apiPOST(
                `/${role}/posting_positions/delete`,
                rawPostingPosition
            )) as RawPostingPosition;
            dispatch(deleteOnePostingPositionSuccess(data));
        },
});

export const exportPosting = validatedApiDispatcher({
    name: "exportPosting",
    description: "Export a posting",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher:
        (
            postingId: number,
            formatter: (posting: Posting, exportFormat: ExportFormat) => File,
            format: ExportFormat = "spreadsheet"
        ) =>
        async (dispatch, getState) => {
            if (!(formatter instanceof Function)) {
                throw new Error(
                    `"formatter" must be a function when using the export action.`
                );
            }
            // Re-fetch all applicants from the server in case things happened to be out of sync.
            await Promise.all([dispatch(fetchPostings())]);
            const postings = postingsSelector(getState());
            const posting = postings.find(
                (posting) => posting.id === postingId
            );

            if (posting == null) {
                throw new Error(`Could not find posting with id ${postingId}`);
            }

            return formatter(posting, format);
        },
});

function isRawPostingPosition(
    obj: any
): obj is RequireSome<RawPostingPosition, "position_id" | "posting_id"> {
    if (
        obj != null &&
        typeof obj === "object" &&
        "posting_id" in obj &&
        "position_id" in obj
    ) {
        return true;
    }
    return false;
}

function prepPostingPositionForApi(
    obj:
        | RequireSome<PostingPosition, "position" | "posting">
        | RequireSome<RawPostingPosition, "position_id" | "posting_id">
): RequireSome<RawPostingPosition, "position_id" | "posting_id"> {
    if (isRawPostingPosition(obj)) {
        return obj;
    }
    const [core, rest] = splitObjByProps(obj, ["position", "posting"]);
    return {
        ...core,
        position_id: rest.position.id,
        posting_id: rest.posting.id,
    };
}

// selectors
/**
 * Since Postings and PostingPositions reference each other,
 * we need a function that can create both at the same time.
 *
 * @param {RawPosting} rawPosting
 * @param {RawPostingPosition[]} rawPostingPositions
 * @param {Position[]} positions
 * @returns
 */
function combinePostingAndPostingPosition(
    rawPosting: RawPosting,
    rawPostingPositions: RawPostingPosition[],
    positions: Position[]
) {
    const positionsMap = new Map(
        positions.map((position) => [position.id, position])
    );
    // eslint-disable-next-line
    const [partialPosting, _postingRest] = splitObjByProps(rawPosting, [
        "application_ids",
    ]);
    const posting: Posting = {
        ...partialPosting,
        applications: [],
        posting_positions: [],
    };
    const postingPositions = rawPostingPositions
        // We only want PostingPositions associated with the given posting
        .filter(
            (rawPostingPosition) =>
                rawPostingPosition.posting_id === rawPosting.id
        )
        // We only want PostingPositions whose corresponding position has been loaded/exits
        .filter((rawPostingPosition) =>
            positionsMap.has(rawPostingPosition.position_id)
        )
        .map<PostingPosition>((rawPostingPosition) => {
            const [partialPostingPosition, rest] = splitObjByProps(
                rawPostingPosition,
                ["position_id", "posting_id"]
            );
            return {
                ...partialPostingPosition,
                position: positionsMap.get(rest.position_id)!,
                posting,
            };
        });

    posting.posting_positions = postingPositions;

    return { posting, postingPositions };
}

const localStoreSelector = postingsReducer._localStoreSelector;
const localStoreSelector2 = postingPositionsReducer._localStoreSelector;
export const postingsSelector = createSelector(
    localStoreSelector,
    localStoreSelector2,
    positionsSelector,
    (postingsState, postingPositionsState, positions) => {
        const rawPostingPositions = postingPositionsState._modelData;
        return postingsState._modelData
            .map((rawPosting) =>
                combinePostingAndPostingPosition(
                    rawPosting,
                    rawPostingPositions,
                    positions
                )
            )
            .map((processed) => processed.posting);
    }
);

export const postingPositionsSelector = createSelector(
    localStoreSelector2,
    localStoreSelector,
    positionsSelector,
    (postingPositionsState, postingsState, positions) => {
        const rawPostingPositions = postingPositionsState._modelData;
        return (
            postingsState._modelData
                .map((rawPosting) =>
                    combinePostingAndPostingPosition(
                        rawPosting,
                        rawPostingPositions,
                        positions
                    )
                )
                .map((processed) => processed.postingPositions)
                // A PostingPosition is uniquely determined by its Position and Posting, so
                // it is impossible to have duplicates when we call `.flat()`
                .flat()
        );
    }
);
