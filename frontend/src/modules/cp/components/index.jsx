import React from "react";
import { connect } from "react-redux";
import { Button, ButtonGroup } from "react-bootstrap";
import {
    fetchSessions,
    setActiveSession,
    sessionsSelector
} from "../../../api/actions";

class SessionSelect extends React.Component {
    componentDidMount() {
        this.props.fetchSessions();
    }
    render() {
        const { sessions, activeSession, setActiveSession } = this.props;
        const activeSessionId = (activeSession || {}).id;
        return (
            <div>
                <div>Select Session</div>
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

const mapStateToProps = ({ model: { sessions } }) => ({
    sessions: sessionsSelector(sessions),
    activeSession: sessions.activeSession
});
const mapDispatchToProps = { fetchSessions, setActiveSession };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SessionSelect);
