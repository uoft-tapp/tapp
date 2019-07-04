import React from "react";
import PropTypes from "prop-types";
import { Button, ButtonGroup } from "react-bootstrap";

export class SessionSelect extends React.Component {
    static propTypes = {
        fetchSessions: PropTypes.func.isRequired,
        setActiveSession: PropTypes.func.isRequired,
        sessions: PropTypes.array.isRequired,
        activeSession: PropTypes.object
    };
    componentDidMount() {
        this.props.fetchSessions();
    }
    render() {
        const { sessions, activeSession, setActiveSession } = this.props;
        const activeSessionId = (activeSession || {}).id;
        return (
            <div>
                <h3>Select Session</h3>
                <ButtonGroup>
                    {sessions.map(s => (
                        <Button
                            key={s.id}
                            onClick={() => setActiveSession(s)}
                            variant={
                                activeSessionId === s.id
                                    ? "primary"
                                    : "secondary"
                            }
                        >
                            {s.name}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>
        );
    }
}
