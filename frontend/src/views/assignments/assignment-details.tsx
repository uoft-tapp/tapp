import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import {
    assignmentsSelector,
    fetchWageChunksForAssignment,
} from "../../api/actions";
import { Button, Modal, Alert, Spinner } from "react-bootstrap";
import { Assignment, WageChunk } from "../../api/defs/types";
import { formatDate } from "../../libs/utils";
import { ActionButton } from "../../components/action-buttons";
import { FaSearchDollar } from "react-icons/fa";

function WagechunkDetails({ wageChunks }: { wageChunks: WageChunk[] }) {
    return (
        <table className="wagechunk-details-table">
            <thead>
                <tr>
                    <th>Hours</th>
                    <th>Rate</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                </tr>
            </thead>
            <tbody>
                {(wageChunks || []).map((chunk, i) => (
                    <tr key={i}>
                        <td>{chunk.hours}</td>
                        <td>{chunk.rate}</td>
                        <td>{formatDate(chunk.start_date || "")}</td>
                        <td>{formatDate(chunk.end_date || "")}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function ConnectedAssignmentDetails({
    assignmentId,
}: {
    assignmentId: Number;
}) {
    const assignments = useSelector<any, Assignment[]>(assignmentsSelector);
    const assignment = assignments.find((a) => a.id === assignmentId);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (assignment?.wage_chunks) {
            // If the assignment already has wage chunks, we don't need to refetch them.
            return;
        }

        dispatch(fetchWageChunksForAssignment(assignment));
    }, [assignment, dispatch]);

    if (!assignment) {
        return <div>No Assignment found with ID "{assignmentId}"</div>;
    }

    return (
        <table className="assignment-details-table">
            <tbody>
                <tr>
                    <th>Position</th>
                    <td>
                        {assignment.position.position_code}{" "}
                        {assignment.position.position_title}
                    </td>
                </tr>
                <tr>
                    <th>Applicant Name</th>
                    <td>
                        {assignment.applicant.last_name},{" "}
                        {assignment.applicant.first_name}
                    </td>
                </tr>
                <tr>
                    <th>Total Hours</th>
                    <td>{assignment.hours}</td>
                </tr>
                <tr>
                    <th>Offer Status</th>
                    <td>{assignment.active_offer_status || "No Offer"}</td>
                </tr>
                <tr>
                    <th>Pay Description</th>
                    <td>
                        {assignment.wage_chunks ? (
                            <WagechunkDetails
                                wageChunks={assignment.wage_chunks}
                            />
                        ) : (
                            <Spinner
                                animation="border"
                                size="sm"
                                className="mr-1"
                            />
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export function ConnectedViewAssignmentDetailsAction() {
    const assignments = useSelector<any, Assignment[]>(assignmentsSelector);
    const { selectedAssignmentIds } = useSelector<
        any,
        { selectedAssignmentIds: Number[] }
    >(offerTableSelector);
    const selectedAssignments = assignments.filter((assignment) =>
        selectedAssignmentIds.includes(assignment.id)
    );
    const [dialogVisible, setDialogVisible] = React.useState<Boolean>(false);

    // We want to show the assignment details in a predictable order, so sort
    // by position code and then last, first
    selectedAssignments.sort((a, b) => {
        const aHash = `${a.position.position_code} ${a.applicant.last_name} ${a.applicant.first_name}`;
        const bHash = `${b.position.position_code} ${b.applicant.last_name} ${b.applicant.first_name}`;
        return aHash === bHash ? 0 : aHash > bHash ? 1 : -1;
    });

    let assignmentDetails: JSX.Element | JSX.Element[] = (
        <Alert variant="info">
            There are no selected assignments. You must select assignments to
            see their details.
        </Alert>
    );
    if (selectedAssignments.length > 0) {
        assignmentDetails = selectedAssignments.map((assignment, i) => {
            let split = i === 0 ? null : <hr />;
            return (
                <React.Fragment key={i}>
                    {split}
                    <ConnectedAssignmentDetails
                        assignmentId={assignment.id}
                        key={i}
                    />
                </React.Fragment>
            );
        });
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaSearchDollar}
                onClick={() => setDialogVisible(true)}
                title="View details of selected assignment(s)"
            >
                Assignment Details
            </ActionButton>
            <Modal
                show={dialogVisible}
                onHide={() => setDialogVisible(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Assignment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>{assignmentDetails}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="light"
                        onClick={() => setDialogVisible(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
