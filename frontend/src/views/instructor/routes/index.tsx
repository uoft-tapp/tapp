import React from "react";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { InstructorAssignmentsView } from "../assignments";
import { InstructorDdahsView } from "../ddahs";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { setActivePositionId } from "../store/actions";
import { InstructorSessionsView } from "../sessions";
import { InstructorPreferencesView } from "../preferences";
import { useSelector } from "react-redux";
import { activeSessionSelector } from "../../../api/actions";

/**
 * React component that will update the active position id in the
 * Redux store whenever it is rendered. This component is meant to be the first
 * component in a route that depends on an active position.
 */
function UpdateActivePosition() {
    const params = useParams<{ position_id?: string }>();
    const dispatch = useThunkDispatch();
    const rawPositionId = +(params.position_id || NaN);
    const position_id = Number.isFinite(rawPositionId) ? rawPositionId : null;
    React.useEffect(() => {
        dispatch(setActivePositionId(position_id));
    }, [position_id, dispatch]);
    return null;
}

export function InstructorRoutes() {
    const activeSession = useSelector(activeSessionSelector);
    const showPreferences =
        activeSession?.applications_visible_to_instructors || false;
    const defaultPositionsRedirect = showPreferences
        ? "/positions/:position_id/preferences"
        : "/positions/:position_id/assignments";

    return (
        <Switch>
            <Route exact path="/">
                <Redirect from="/" to="/sessions/details" />
            </Route>
            <Route path="/positions/:position_id/preferences">
                <UpdateActivePosition />
                {showPreferences && <InstructorPreferencesView />}
            </Route>
            <Route path="/positions/:position_id/assignments">
                <UpdateActivePosition />
                <InstructorAssignmentsView />
            </Route>
            <Route path="/positions/:position_id/ddahs">
                <UpdateActivePosition />
                <InstructorDdahsView />
            </Route>
            <Route exact path="/sessions/details">
                <InstructorSessionsView />
            </Route>
            <Redirect
                from="/positions/:position_id"
                to={defaultPositionsRedirect}
            />
            <Redirect from="/sessions" to="/sessions/details" />
        </Switch>
    );
}
