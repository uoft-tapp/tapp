import React from "react";
import { useSelector } from "react-redux";
import {
    sessionsSelector,
    activeSessionSelector,
    setActiveUserRole,
    setActiveSession,
    activeUserSelector,
    activeRoleSelector,
} from "../../api/actions";
import { ActiveUserDisplay } from "../../components/active-user";
import { ActiveSessionDisplay } from "../../components/active-session";
import { Session, Role } from "../../api/defs/types";
import { useThunkDispatch } from "../../libs/thunk-dispatch";

export function ConnectedActiveSessionDisplay() {
    const sessions = useSelector(sessionsSelector);
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();

    function _setActiveSession(session: Session) {
        return dispatch(setActiveSession(session));
    }

    return (
        <ActiveSessionDisplay
            sessions={sessions}
            activeSession={activeSession}
            setActiveSession={_setActiveSession}
        />
    );
}

export function ConnectedActiveUserDisplay() {
    const activeUser = useSelector(activeUserSelector);
    const activeRole = useSelector(activeRoleSelector);
    const dispatch = useThunkDispatch();

    function _setActiveUserRole(role: Role) {
        return dispatch(setActiveUserRole(role));
    }

    return (
        <ActiveUserDisplay
            activeUser={activeUser}
            activeRole={activeRole}
            setActiveUserRole={_setActiveUserRole}
        />
    );
}
