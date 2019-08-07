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
import { SessionSelect } from "../../components/session-select";
import { ApplicantsList } from "../../components/applicants-list";
import { PositionTemplatesList } from "../../components/postition-templates-list";
import { InstructorsList } from "../../components/instructors-list";
import { PositionsList } from "../../components/positions-list";
import { AssignmentsList } from "../../components/assignments-list";
import { SearchBox } from "../../components/search-box";
import { CustomTable } from "../../components/custom-table";

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

const ConnectedInstructorsList = connect(state => ({
    instructors: instructorsSelector(state)
}))(InstructorsList);

const ConnectedPositionsList = connect(state => ({
    positions: positionsSelector(state)
}))(PositionsList);

const ConnectedAssignmentsList = connect(state => ({
    assignments: assignmentsSelector(state)
}))(AssignmentsList);

const ConnectedSearchBox = connect(state => ({
    data: applicantsSelector(state)
}))(SearchBox);

const ConnectedOfferTable = connect(state => ({
    data: state.ui.offerTable
}))(CustomTable);

const COLUMNS = [
    { Header: "First Name", accessor: "first_name", width: 100 },
    { Header: "Last Name", accessor: "last_name", width: 100 },
    { Header: "Email", accessor: "email", width: 250 },
    { Header: "Position title", accessor: "position_title", width: 130 },
    {
        Header: "First Time?",
        accessor: "first_time_ta",
        Cell: props => <span>{props.value.toString().toUpperCase()}</span>,
        width: 100
        // filterMethod: (filter, row) =>
        //             row[filter.id].startsWith(filter.value) &&
        //             row[filter.id].endsWith(filter.value)
    }, // boolean
    { Header: "Status", accessor: "status", width: 100 },
    { Header: "Nag Count", accessor: "nag_count", width: 100 }
];

const DATA = [
    {
        id: 1,
        first_name: "Simon",
        last_name: "Aayani",
        email: "simon.aayani@mail.utoronto.ca",
        position_title: "Teaching Assistant",
        first_time_ta: true,
        status: "Rejected",
        nag_count: 1
    },
    {
        id: 2,
        first_name: "Danny",
        last_name: "Liu",
        email: "danny.liu@mail.utoronto.ca",
        position_title: "Teaching Assistant",
        first_time_ta: false,
        status: "Accepted",
        nag_count: 1
    },
    {
        id: 3,
        first_name: "Jiahuang",
        last_name: "Lin",
        email: "jacob.lin@mail.utoronto.ca",
        position_title: "Teaching Assistant",
        first_time_ta: false,
        status: "Pending",
        nag_count: 2
    },
    {
        id: 4,
        first_name: "George",
        last_name: "Wu",
        email: "george.wu@mail.utoronto.ca",
        position_title: "Teaching Assistant",
        first_time_ta: false,
        status: "Withdraw",
        nag_count: 4
    },
    {
        id: 5,
        first_name: "Zane",
        last_name: "Huang",
        email: "zane.huang@mail.utoronto.ca",
        position_title: "Research Assistant",
        first_time_ta: true,
        status: "Accepted",
        nag_count: 1
    },
    {
        id: 6,
        first_name: "Michelle",
        last_name: "Chai",
        email: "michelle.chai@mail.utoronto.ca",
        position_title: "Research Assistant",
        first_time_ta: true,
        status: "Accepted",
        nag_count: 1
    }
];

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
            <DashboardWidget title="OfferTable">
                <CustomTable data={DATA} columns={COLUMNS} keyField="id" />
            </DashboardWidget>
        </div>
    );
}

export default Dashboard;
