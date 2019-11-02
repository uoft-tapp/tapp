import React from "react";
import { connect } from "react-redux";
import {
    fetchSessions,
    setActiveSession,
    sessionsSelector,
    activeSessionSelector,
    applicantsSelector,
    positionTemplatesSelector,
    instructorsSelector,
    positionsSelector,
    assignmentsSelector
} from "../../api/actions";
import { offerTableSelector } from "../offertable/actions";
import { SessionSelect, SessionEditor } from "../../components/sessions";
import { ApplicantsList } from "../../components/applicants-list";
import { PositionTemplatesList } from "../../components/postition-templates-list";
import { ConnectedInstructorsList } from "../instructors";
import { PositionsList } from "../../components/positions-list";
import { AssignmentsList } from "../../components/assignments-list";
import { SearchBox } from "../../components/search-box";
import { EmailButton } from "../../components/email-button";
import { ImportButton } from "../../components/import-button";
import { EditableField } from "../../components/edit-field-widgets";
import { ConnectedOfferTable } from "../offertable";
import { PositionEditor } from "../../components/add-position";
import { InstructorEditor } from "../../components/instructors";

// Connect the SessionSelect component
let mapStateToProps = state => {
    return {
        sessions: sessionsSelector(state),
        activeSession: activeSessionSelector(state)
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

const ConnectedPositionTemplateList = connect(state => ({
    position_templates: positionTemplatesSelector(state)
}))(PositionTemplatesList);

const ConnectedPositionsList = connect(state => ({
    positions: positionsSelector(state)
}))(PositionsList);

const ConnectedAssignmentsList = connect(state => ({
    assignments: assignmentsSelector(state)
}))(AssignmentsList);

const ConnectedSearchBox = connect(state => ({
    data: applicantsSelector(state)
}))(SearchBox);

const ConnectedEmailButton = connect(state => ({
    data: offerTableSelector(state).selectedAssignmentIds
}))(EmailButton);

const ConnectedPositionEditor = connect(state => ({
    instructors: instructorsSelector(state)
}))(PositionEditor);

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
    const [position, setPosition] = React.useState({ position_code: "" });
    const [instructor, setInstructor] = React.useState({
        last_name: "Baggins",
        first_name: "Bilbo",
        utorid: "bilbob"
    });
    const [session, setSession] = React.useState({ name: "" });
    return (
        <div>
            <DashboardWidget title="SessionEditor">
                <SessionEditor session={session} setSession={setSession} />
            </DashboardWidget>
            <DashboardWidget title="InstructorEditor">
                <InstructorEditor
                    instructor={instructor}
                    setInstructor={setInstructor}
                />
            </DashboardWidget>
            <DashboardWidget title="PositionEditor">
                <ConnectedPositionEditor
                    position={position}
                    setPosition={setPosition}
                />
            </DashboardWidget>
            <DashboardWidget title="EditableField">
                <EditableField
                    title="Edit this super awesome content"
                    value={45}
                    onChange={console.log}
                >
                    Edit me!
                </EditableField>
            </DashboardWidget>
            <DashboardWidget title="SessionSelect">
                <ConnectedSessionSelect />
            </DashboardWidget>
            <DashboardWidget title="ApplicantsList">
                <ConnectedApplicantList />
            </DashboardWidget>
            <DashboardWidget title="PostitionTemplatesList">
                <ConnectedPositionTemplateList />
            </DashboardWidget>
            <DashboardWidget title="InstuctorsList">
                <ConnectedInstructorsList />
            </DashboardWidget>
            <DashboardWidget title="PositionsList">
                <ConnectedPositionsList />
            </DashboardWidget>
            <DashboardWidget title="AssignmentsList">
                <ConnectedAssignmentsList />
            </DashboardWidget>
            <DashboardWidget title="SearchBox">
                <ConnectedSearchBox />
            </DashboardWidget>
            <DashboardWidget title="ImportButton">
                <ImportButton />
            </DashboardWidget>
            <DashboardWidget title="EmailButton">
                <ConnectedEmailButton />
            </DashboardWidget>
            <DashboardWidget title="OfferTable">
                <ConnectedOfferTable />
            </DashboardWidget>
        </div>
    );
}

export default Dashboard;
