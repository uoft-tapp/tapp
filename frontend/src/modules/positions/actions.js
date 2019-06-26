import {
    FETCH_POSITIONS_SUCCESS,
    SAVE_POSITION_SUCCESS,
    OPEN_EDIT_POSITION_MODAL,
    CLOSE_EDIT_POSITION_MODAL,
    DELETE_POSITION_SUCCESS,
    CREATE_NEW_POSITION_SUCCESS,
    IMPORT_NEW_POSITION_SUCCESS,
    IMPORT_NEW_POSITION_RESULT
} from "./constants";
import { show, error, success } from "react-notification-system-redux";
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

export const createNewPosition = payload => async dispatch => {
    const res = await fetch("/api/v1/positions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 201) {
        dispatch(createNewPositionSuccess(data));
        window.location = "/tapp/positions";
    } else {
        dispatch(error({ ...errorProps, message: res.statusText }));
        if (data) {
            Object.keys(data).map(key =>
                dispatch(
                    error({ ...errorProps, message: key + ": " + data[key] })
                )
            );
        }
    }
};

//used for checking result of importNewPosition calls
let SUCCESS_COUNT = 0;
let FAIL_COUNT = 0;

export function getCount() {
    return {
        type: IMPORT_NEW_POSITION_RESULT,
        SUCCESS: SUCCESS_COUNT,
        FAILS: FAIL_COUNT
    };
}

export const importResult = (
    success_imports,
    failed_imports
) => async dispatch => {
    dispatch(
        show(
            {
                message:
                    success_imports +
                    " CSV Records Imported! " +
                    failed_imports +
                    " CSV Records Not Imported Due To Errors!"
            },
            "info"
        )
    );
};

//used for uploading csv files
export const importNewPosition = payload => async dispatch => {
    const res = await fetch("/api/v1/positions/import", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
        // 200 (OK) and 201 (CREATED) are both good calls
        SUCCESS_COUNT++;
        dispatch(importNewPositionSuccess(data));
    } else {
        FAIL_COUNT++;
        dispatch(error({ ...errorProps, message: res.statusText }));
        if (data) {
            Object.keys(data).map(key =>
                dispatch(
                    error({
                        ...errorProps,
                        message:
                            JSON.stringify(payload) +
                            "\nImport call failed:   " +
                            key +
                            ": " +
                            data[key]
                    })
                )
            );
        }
    }
};

export const importNewPositionSuccess = payload => ({
    type: IMPORT_NEW_POSITION_SUCCESS,
    payload
});
export const createNewPositionSuccess = payload => ({
    type: CREATE_NEW_POSITION_SUCCESS,
    payload
});
