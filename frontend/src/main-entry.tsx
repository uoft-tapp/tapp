import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { initFromStage, activeRoleSelector } from "./api/actions";
import { ConnectedNotifications } from "./views/notifications";
import { AdminRoutes, InstructorRoutes } from "./views/routes";
import { AdminHeader } from "./views/admin-header";

import "bootstrap/dist/css/bootstrap.min.css";
import "./main-entry.css";
import { InstructorHeader } from "./views/instructor";
import { useThunkDispatch } from "./libs/thunk-dispatch";

/**
 * This is the entry point for full app for admins/instructors/tas
 *
 * @export
 * @returns
 */
export default function ConnectedApp() {
    const activeRole = useSelector(activeRoleSelector);
    const dispatch = useThunkDispatch();

    useEffect(() => {
        // When the page is first loaded, we need to fetch all the data
        // associated with the page. This is done via a call to `initFromStage`.
        dispatch(initFromStage("pageLoad"));
    }, [dispatch]);

    let body = <div>Loading...</div>;

    if (activeRole === "admin") {
        body = (
            <>
                <AdminHeader />
                <div className="view-container">
                    <AdminRoutes />
                </div>
            </>
        );
    }

    if (activeRole === "instructor") {
        body = (
            <>
                <InstructorHeader />
                <div className="view-container">
                    <InstructorRoutes />
                </div>
            </>
        );
    }
    if (activeRole === "ta") {
        body = <div>"Viewing as TA"</div>;
    }

    return (
        <React.Fragment>
            {body}
            <ConnectedNotifications />
        </React.Fragment>
    );
}
