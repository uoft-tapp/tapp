import {
    CREATE_NEW_POSITION_SUCCESS,
    IMPORT_NEW_POSITION_SUCCESS,
    IMPORT_NEW_POSITION_RESULT
} from "./constants";
import { show, error } from "react-notification-system-redux";
import { errorProps } from "../../modules/notifications/constants";
import { apiPOST } from "../../libs/apiUtils";



export const createNewPosition = payload => async dispatch => {
    try {
        const data = await apiPOST("/positions", payload);
        dispatch(createNewPositionSuccess(data));
        window.location = "/tapp/positions";
    } catch (e) {
        dispatch(error({ ...errorProps, message: e.toString() }));
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
    try {
        const data = await apiPOST("/positions/import", payload);
        SUCCESS_COUNT++;
        dispatch(importNewPositionSuccess(data));
    } catch (e) {
        dispatch(
            error({
                ...errorProps,
                message: e.toString()
            })
        );
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
