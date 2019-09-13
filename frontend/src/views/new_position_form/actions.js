import { show } from "react-notification-system-redux";



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