import {
    FETCH_POSITIONS_SUCCESS,
    SAVE_POSITION_SUCCESS,
    OPEN_EDIT_POSITION_MODAL,
    CLOSE_EDIT_POSITION_MODAL,
    DELETE_POSITION_SUCCESS
} from "./constants";
import { error, success } from "react-notification-system-redux";
import { errorProps, successProps } from "../notifications/constants";
import { apiGET, apiPOST } from "../../libs/apiUtils";

export const fetchPositionsSuccess = payload => ({
    type: FETCH_POSITIONS_SUCCESS,
    payload
});
export const fetchPositions = () => async dispatch => {
    try {
        const data = await apiGET("/positions");
        dispatch(fetchPositionsSuccess(data));
    } catch (e) {
        dispatch(error({ ...errorProps, message: e.toString() }));
    }
};

export const savePositions = payload => async dispatch => {
    try {
        const data = await apiPOST(
            "/positions/" + payload.positionId,
            payload.newValues
        );
        dispatch(savePositionsSuccess(data));
        dispatch(success({ ...successProps, title: "Position Updated" }));
    } catch (e) {
        dispatch(error({ ...errorProps, message: e.toString() }));
    }
};

export const savePositionsSuccess = payload => ({
    type: SAVE_POSITION_SUCCESS,
    payload
});

export const openPositionEditModal = id => ({
    type: OPEN_EDIT_POSITION_MODAL,
    payload: { id }
});

export const closeEditPositionModal = () => ({
    type: CLOSE_EDIT_POSITION_MODAL
});

export const deletePosition = payload => async dispatch => {
    const res = await fetch(`/api/v1/positions/${payload.positionId}`, {
        method: "DELETE"
    });
    if (res.status === 204) {
        dispatch(deletePositionSuccess(payload));
        dispatch(
            success({
                ...successProps,
                title: `Position ${payload.positionId} Deleted`
            })
        );
    } else {
        dispatch(error({ ...errorProps, message: res.statusText }));
    }
};

export const deletePositionSuccess = payload => ({
    type: DELETE_POSITION_SUCCESS,
    payload
});