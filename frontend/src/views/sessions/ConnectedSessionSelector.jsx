import { connect } from "react-redux";

import { 
    fetchSessions,
    setActiveSession,
    sessionsSelector,
    activeSessionSelector
} from "../../api/actions";
import { SessionSelect } from "../../components/session-select";

let mapStateToProps = state => {
    return {
        sessions: sessionsSelector(state),
        activeSession: activeSessionSelector(state)
    };
};

let mapDispatchToProps = { fetchSessions, setActiveSession };

export const ConnectedSessionSelect = connect(
    mapStateToProps,
    mapDispatchToProps
)(SessionSelect);

