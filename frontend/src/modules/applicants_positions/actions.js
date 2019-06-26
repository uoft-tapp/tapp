import {
    FETCH_POSITIONS_SUCCESS,
    SAVE_POSITION_SUCCESS,
    OPEN_EDIT_POSITION_MODAL,
    CLOSE_EDIT_POSITION_MODAL
} from "./constants";
import { error, success } from "react-notification-system-redux";
import { errorProps, successProps } from "../notifications/constants";

export const fetchPositionsSuccess = payload => ({
    type: FETCH_POSITIONS_SUCCESS,
    payload
});
export const fetchPositions = () => async dispatch => {
    const res = await fetch("/api/v1/positions");
    const data = await res.json();
    if (res.status === 200) {
        dispatch(fetchPositionsSuccess(data));
    } else {
        dispatch(error({ ...errorProps, message: "Fetch Position Failure" }));
    }
};

export const savePositions = payload => async dispatch => {
    const res = await fetch(`/api/v1/positions/${payload.positionId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload.newValues)
    });
    const data = await res.json();
    if (res.status === 200) {
        dispatch(savePositionsSuccess(data));
        dispatch(success({ ...successProps, title: "Position Updated" }));
    } else {
        dispatch(error({ ...errorProps, message: res.statusText }));
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
