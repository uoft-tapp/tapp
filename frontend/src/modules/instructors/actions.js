import {
    FETCH_INSTRUCTORS_SUCCESS,
    FETCH_INSTRUCTORS_ERROR
} from "./constants";
import { apiGET } from "../../libs/apiUtils";

export const fetchInstructorsSuccess = payload => ({
    type: FETCH_INSTRUCTORS_SUCCESS,
    payload
});

export const fetchInstructorsError = payload => ({
    type: FETCH_INSTRUCTORS_ERROR,
    error: true,
    payload
});

export const fetchInstructors = () => async dispatch => {
    try {
        const data = await apiGET("/instructors");
        dispatch(fetchInstructorsSuccess(data));
    } catch (e) {
        return dispatch(fetchInstructorsError(e.toString()));
    }
};
