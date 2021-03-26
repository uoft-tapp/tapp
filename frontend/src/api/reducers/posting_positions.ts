import {
    FETCH_POSTING_POSITIONS_SUCCESS,
    FETCH_ONE_POSTING_POSITION_SUCCESS,
    UPSERT_ONE_POSTING_POSITION_SUCCESS,
    DELETE_ONE_POSTING_POSITION_SUCCESS,
} from "../constants";
import { RawPostingPosition } from "../defs/types";
import { createReducer, HasPayload } from "./utils";

interface PositionPostingState {
    _modelData: RawPostingPosition[];
}
const initialState: PositionPostingState = {
    _modelData: [],
};

export function upsertItem(
    modelData: RawPostingPosition[],
    newItem: RawPostingPosition
): RawPostingPosition[] {
    let didUpdate = false;
    const newModelData = modelData.map((item) => {
        if (
            item.position_id === newItem.position_id &&
            item.posting_id === newItem.posting_id
        ) {
            didUpdate = true;
            return newItem;
        }
        return item;
    });
    if (!didUpdate) {
        newModelData.push(newItem);
    }
    return newModelData;
}

// PositionPostings have no `id` field, but they are uniquely determined
// by their `position_id` adn `posting_id`. So, we need to create custom
// reducer functions.
export const postingPositionsReducer = createReducer(initialState, {
    [FETCH_POSTING_POSITIONS_SUCCESS]: (
        state: PositionPostingState,
        action: HasPayload<RawPostingPosition[]>
    ) => ({
        ...state,
        _modelData: action.payload,
    }),
    [FETCH_ONE_POSTING_POSITION_SUCCESS]: (
        state: PositionPostingState,
        action: HasPayload<RawPostingPosition>
    ) => ({
        ...state,
        _modelData: upsertItem(state._modelData, action.payload),
    }),
    [UPSERT_ONE_POSTING_POSITION_SUCCESS]: (
        state: PositionPostingState,
        action: HasPayload<RawPostingPosition>
    ) => ({
        ...state,
        _modelData: upsertItem(state._modelData, action.payload),
    }),
    [DELETE_ONE_POSTING_POSITION_SUCCESS]: (
        state: PositionPostingState,
        action: HasPayload<RawPostingPosition>
    ) => {
        const deletedItem = action.payload;
        return {
            ...state,
            _modelData: state._modelData.filter(
                (item) =>
                    !(
                        item.position_id === deletedItem.position_id &&
                        item.posting_id === deletedItem.posting_id
                    )
            ),
        };
    },
});
