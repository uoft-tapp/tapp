import React from "react";
import { useSelector } from "react-redux";
import {
    activeSessionSelector,
    sessionsSelector,
    setActiveSession,
} from "../../api/actions";
import { positionsSelector } from "../../api/actions/positions";
import { Header } from "../../components/header";
import { useThunkDispatch } from "../../libs/thunk-dispatch";
import { guessActiveSession } from "../../libs/utils";
import {
    ConnectedActiveSessionDisplay,
    ConnectedActiveUserDisplay,
} from "../common/header-components";

/**
 * Header showing the routes that a user with `role=instructor`
 * can see.
 *
 * @returns
 */
export function InstructorHeader() {
    const positions = useSelector(positionsSelector);
    const sessions = useSelector(sessionsSelector);
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();
    React.useEffect(() => {
        function guessSessionIfNeeded() {
            // If there's no active session, make a best guess and set that as the active session
            if (activeSession == null) {
                const guessedSession = guessActiveSession(sessions);
                if (guessedSession) {
                    dispatch(setActiveSession(guessedSession));
                }
            }
        }
        // Globals are initialized asynchronously, so they may not be set by the time we reach this function.
        // Thus, we run `guessSessionIfNeeded` asynchronously in the hopes that Globals are set by
        // the time it runs.
        const timeoutId = window.setTimeout(guessSessionIfNeeded, 100);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [dispatch, activeSession, sessions]);

    const preferencesRoute = activeSession?.applications_visible_to_instructors
        ? [
              {
                  route: `/preferences`,
                  name: `TA Preferences`,
                  description: `View information about TAs who have applied to your course`,
              },
          ]
        : [];

    const routes = positions
        .map((position) => ({
            route: `/positions/${position.id}`,
            name: `${position.position_code}`,
            description: `View information about position ${position.position_code} ${position.position_title}`,
            subroutes: [
                ...preferencesRoute,
                {
                    route: `/assignments`,
                    name: `Assigned TAs`,
                    description: `View information about your TAs`,
                },
                {
                    route: `/ddahs`,
                    name: `DDAHs`,
                    description: `Manage your TAs' DDAH forms`,
                },
            ],
        }))
        .concat([
            {
                route: "/sessions",
                name: "Courses from Other Sessions",
                description: "View TA information for other sessions",
                subroutes: [
                    {
                        route: "/details",
                        name: "Details",
                        description: "Details about other sessions",
                    },
                ],
            },
        ]);

    return (
        <Header
            routes={routes}
            infoComponents={[
                <ConnectedActiveSessionDisplay key={0} />,
                <ConnectedActiveUserDisplay key={1} />,
            ]}
        />
    );
}
