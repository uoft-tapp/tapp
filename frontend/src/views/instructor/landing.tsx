import React from "react";
import { useSelector } from "react-redux";
import { activeSessionSelector } from "../../api/actions";
import { ConnectedActiveSessionDisplay } from "../common/header-components";
import { ContentArea } from "../../components/layout";
import { Session } from "../../api/defs/types";

function ConnectedLandingView() {
    const activeSession = useSelector(activeSessionSelector) as Session | null;

    let activeSessionInfo = (
        <>
            There is currently <b className="text-primary">no active session</b>{" "}
            selected. Please select one below.
        </>
    );
    if (activeSession) {
        activeSessionInfo = (
            <>
                The current active session is{" "}
                <b className="text-primary">{activeSession.name}</b>. You may
                select a different session below.
            </>
        );
    }

    return (
        <div className="page-body">
            <ContentArea>
                <h2>Welcome to TAPP!</h2>
                <p>
                    TAPP is a TA administration program designed for creating
                    and distributing TA contracts.
                </p>
                <p>
                    In order to use most features of TAPP, you need to select a{" "}
                    <i>session</i>. {activeSessionInfo}
                </p>
                <ConnectedActiveSessionDisplay />
            </ContentArea>
        </div>
    );
}

export { ConnectedLandingView as Landing };
