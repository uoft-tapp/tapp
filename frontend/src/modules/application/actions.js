import { UPDATE_FIELD } from "./constants"

// an action generator function that returns an action object
export const updateField = data => ({ type: UPDATE_FIELD, data })
