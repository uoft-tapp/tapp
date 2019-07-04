import React from "react";
import { connect } from "react-redux";
import {
    fetchSessions,
    setActiveSession,
    sessionsSelector,
    applicantsSelector
} from "../../api/actions";
import { localStoreSelector as localSessionStoreSelector } from "../../api/actions/sessions";
import { SessionSelect } from "../../components/session-select";
import { ApplicantsList } from "../../components/applicants-list";

// Connect the SessionSelect component
let mapStateToProps = state => {
    return {
        sessions: sessionsSelector(state),
        activeSession: localSessionStoreSelector(state).activeSession
    };
};
let mapDispatchToProps = { fetchSessions, setActiveSession };
const ConnectedSessionSelect = connect(
    mapStateToProps,
    mapDispatchToProps
)(SessionSelect);

const ConnectedApplicantList = connect(state => ({
    applicants: applicantsSelector(state)
}))(ApplicantsList);

/**
 * Encapsulate a react component in a frame.
 *
 * @param {object} props
 * @param {string} props.title The name of the component encapsulated
 */
function DashboardWidget(props) {
    const { children, title } = props;
    return (
        <div style={{ margin: 5 }}>
            <h5>
                The{" "}
                <span style={{ color: "green", fontFamily: "mono" }}>
                    {title}
                </span>{" "}
                Component
            </h5>
            <div style={{ border: "1px solid black", padding: 5 }}>
                {children}
            </div>
        </div>
    );
}

/**
 * A dashboard containing a sample of all the widgets connected
 * appropriately to the redux store.
 *
 */
function Dashboard() {
    return (
        <div>
            <DashboardWidget title="SessionSelect">
                <ConnectedSessionSelect />
            </DashboardWidget>
            <DashboardWidget title="ApplicantsList">
                <ConnectedApplicantList />
            </DashboardWidget>
        </div>
    );
}

export default Dashboard;
