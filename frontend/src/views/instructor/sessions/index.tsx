import React from "react";
import { useSelector } from "react-redux";

import { ContentArea } from "../../../components/layout";
import { formatDate } from "../../../libs/utils";
import { Accordion, Card, ListGroup, ListGroupItem } from "react-bootstrap";
import {
    activeSessionSelector,
    positionsSelector,
    sessionsSelector,
    setActiveSession,
} from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { NavLink } from "react-router-dom";

export function InstructorSessionsView() {
    const activeSession = useSelector(activeSessionSelector);
    const sessions = useSelector(sessionsSelector);
    const positions = useSelector(positionsSelector);
    const dispatch = useThunkDispatch();

    let heading = (
        <div>
            <h4 className="text-black">No session is currently selected</h4>
        </div>
    );
    if (activeSession) {
        heading = (
            <h4>
                The currently active session is{" "}
                <span className="text-primary">
                    {activeSession.name} ({formatDate(activeSession.start_date)}{" "}
                    to {formatDate(activeSession.end_date)})
                </span>
            </h4>
        );
    }

    const displayPositions = positions.map((position) => (
        <ListGroupItem key={position.position_code}>
            <Card.Link as={NavLink} to={`/positions/${position.id}`}>
                {position.position_code}
                {position.position_title ? ` (${position.position_title})` : ""}
            </Card.Link>
        </ListGroupItem>
    ));

    return (
        <div className="page-body">
            <ContentArea>
                {heading}
                <p>
                    Below is a list of all sessions where you are listed as an
                    instructor. Select a session to see <i>positions</i>{" "}
                    (courses) that you are/were an instructor for.
                </p>
                {sessions.length === 0 ? (
                    <h4>You are not listed as an instructor for any session</h4>
                ) : null}
                <Accordion>
                    {sessions.map((session) => {
                        const isActive = session.id === activeSession?.id;
                        return (
                            <Card
                                key={session.id}
                                bg={isActive ? "primary" : "light"}
                                text={isActive ? "white" : "dark"}
                            >
                                <Card.Header
                                    as="button"
                                    className={`btn text-left ${
                                        isActive ? "btn-primary " : "btn-light"
                                    }`}
                                    onClick={() => {
                                        dispatch(setActiveSession(session));
                                    }}
                                >
                                    {session.name} (
                                    {formatDate(session.start_date)} to{" "}
                                    {formatDate(session.end_date)})
                                </Card.Header>
                                {isActive ? (
                                    <ListGroup className="mx-2 mb-2 text-dark">
                                        {displayPositions.length > 0 ? (
                                            displayPositions
                                        ) : (
                                            <ListGroupItem>
                                                No Positions
                                            </ListGroupItem>
                                        )}
                                    </ListGroup>
                                ) : null}
                            </Card>
                        );
                    })}
                </Accordion>
            </ContentArea>
        </div>
    );
}
