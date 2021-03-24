import { createReducer, HasPayload } from "./utils";
import { API_INTERACTION_START, API_INTERACTION_END } from "../constants";

type Interaction = { id: string; message: string };
interface StatusState {
    ongoingInteraction: boolean;
    ongoingInteractionsList: Interaction[];
}
const initialState: StatusState = {
    ongoingInteraction: false,
    ongoingInteractionsList: [],
};

// Keep a list of all ongoing interactions that are in progress.
// This way we could display a spinner or some-such while interactions
// are going on. Interactions will be mostly network-based interactions.
export const statusReducer = createReducer(initialState, {
    [API_INTERACTION_START]: (state, action: HasPayload<Interaction>) => ({
        ...state,
        ongoingInteraction: true,
        ongoingInteractionsList: [
            ...state.ongoingInteractionsList,
            action.payload,
        ],
    }),
    [API_INTERACTION_END]: (state, action: HasPayload<{ id: string }>) => {
        // remove the current interaction
        const ongoingInteractionsList = state.ongoingInteractionsList.filter(
            (i) => i.id !== action.payload.id
        );
        return {
            ...state,
            ongoingInteraction: ongoingInteractionsList.length > 0,
            ongoingInteractionsList: ongoingInteractionsList,
        };
    },
});
