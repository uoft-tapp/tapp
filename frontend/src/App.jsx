import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { initFromStage, activeRoleSelector } from "./api/actions";
import { ConnectedNotifications } from "./views/notifications";
import { AdminRoutes, InstructorRoutes } from "./views/routes";
import { AdminHeader } from "./views/admin";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { InstructorHeader } from "./views/instructor";
import { useThunkDispatch } from "./libs/thunk-dispatch";

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
        body = "Viewing as TA";
    }

    return (
        <React.Fragment>
            {body}
            <ConnectedNotifications />
        </React.Fragment>
    );
}
