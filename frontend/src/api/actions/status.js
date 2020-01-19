import { API_INTERACTION_START, API_INTERACTION_END } from "../constants";

// actions
export const apiInteractionStart = (id, message) => ({
    type: API_INTERACTION_START,
    payload: { id, message }
});
export const apiInteractionEnd = id => ({
    type: API_INTERACTION_END,
    payload: { id }
});
