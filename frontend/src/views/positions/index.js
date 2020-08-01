import React from "react";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import { ConnectedPositionsList } from "./position-list";
import {
    ConnectedExportPositionsAction,
    ConnectedImportPositionsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlus, FaTrash } from "react-icons/fa";
import { formatDate } from "../../libs/utils";
import { Badge } from "react-bootstrap";
import { activeSessionSelector } from "../../api/actions";
import { useSelector } from "react-redux";
import { MissingActiveSessionWarning } from "../../components/sessions";

export function AdminPositionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaPlus />}
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                    disabled={!activeSession}
                >
                    Add Position
                </ActionButton>
                <ActionButton
                    icon={<FaTrash />}
                    onClick={() => setInDeleteMode(!inDeleteMode)}
                    active={inDeleteMode}
                    disabled={!activeSession}
                >
                    Delete Position
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportPositionsAction disabled={!activeSession} />
                <ConnectedExportPositionsAction disabled={!activeSession} />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify positions, you must select a session." />
                )}
                <ConnectedAddPositionDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                <ConnectedPositionsList inDeleteMode={inDeleteMode} />
            </ContentArea>
        </div>
    );
}

const POSITION_COLUMNS_FOR_INSTRUCTOR_VIEW = [
    { Header: "Position", accessor: "position_code" },
    { Header: "Title", accessor: "position_title" },
    {
        Header: "Start",
        accessor: "start_date",
        Cell: (row) => formatDate(row.value),
    },
    {
        Header: "End",
        accessor: "end_date",
        Cell: (row) => formatDate(row.value),
    },
    {
        Header: "Coordinator(s)",
        accessor: "instructors",
        Cell: (props) => (
            <React.Fragment>
                {props.value.map((instructor = {}) => {
                    const name = `${instructor.first_name} ${instructor.last_name}`;
                    return (
                        <Badge variant="secondary" className="mr-1" key={name}>
                            {name}
                        </Badge>
                    );
                })}
            </React.Fragment>
        ),
    },
    {
        Header: "Enrolled",
        accessor: "current_enrollment",
        maxWidth: 80,
    },
    {
        Header: "Waitlist",
        accessor: "current_waitlisted",
        maxWidth: 90,
    },

    {
        Header: "Contract Type",
        accessor: "contract_template.template_name",
        maxWidth: 120,
    },
];

export function InstructorPositionsView() {
    const activeSession = useSelector(activeSessionSelector);

    let heading = (
        <div>
            <h4 className="text-black">You have not selected a session</h4>
            <h5 className="text-warning">Select a session to view Positions</h5>
        </div>
    );
    if (activeSession) {
        heading = (
            <h4>
                Positions for Session{" "}
                <span className="text-primary">{activeSession.name}</span>
            </h4>
        );
    }

    return (
        <div className="page-body">
            <ContentArea>
                {heading}
                <p>
                    Every <i>position</i> corresponds to a particular
                    job/contract type. If a course has multiple types of TA
                    jobs, that course might be associated with multiple
                    positions.
                </p>
                <ConnectedPositionsList
                    columns={POSITION_COLUMNS_FOR_INSTRUCTOR_VIEW}
                />
            </ContentArea>
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
