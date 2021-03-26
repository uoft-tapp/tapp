import { API_INTERACTION_START, API_INTERACTION_END } from "../constants";

// actions
export const apiInteractionStart = (id: string, message: string) => ({
    type: API_INTERACTION_START,
    payload: { id, message },
});
export const apiInteractionEnd = (id: string) => ({
    type: API_INTERACTION_END,
    payload: { id },
});
