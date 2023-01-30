import React from "react";
import { useSelector } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import {
    assignmentsSelector,
    fetchOfferHistoryForAssignment,
    fetchWageChunksForAssignment,
} from "../../../api/actions";
import { Button, Modal, Alert, Spinner } from "react-bootstrap";
import { Offer, WageChunk } from "../../../api/defs/types";
import {
    capitalize,
    formatDate,
    formatDateTime,
    formatDownloadUrl,
} from "../../../libs/utils";
import { ActionButton } from "../../../components/action-buttons";
import { FaSearch, FaSearchDollar } from "react-icons/fa";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

function OfferHistoryDetails({ offers }: { offers: Offer[] }) {
    if (offers.length === 0) {
        return <span>No Offer</span>;
    }
    return (
        <table className="offer-history-details-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Emailed Date</th>
                    <th>Accepted Date</th>
                    <th>Rejected Date</th>
                    <th>Withdrawn Date</th>
                </tr>
            </thead>
            <tbody>
                {(offers || []).map((offer, i) => {
                    const url = `/public/contracts/${offer.url_token}.pdf`;
                    return (
                        <tr key={i}>
                            <td>
                                <Button
                                    href={formatDownloadUrl(url)}
                                    variant="light"
                                    size="sm"
                                    className="py-0"
                                    title="Download offer PDF"
                                >
                                    <FaSearch />
                                </Button>
                            </td>
                            <td className={`status ${offer.status}`}>
                                {capitalize(offer.status)}
                            </td>
                            <td className="number">{offer.hours}</td>
                            <td
                                title={formatDateTime(
                                    offer.emailed_date || undefined
                                )}
                            >
                                {formatDate(offer.emailed_date || "")}
                            </td>
                            <td
                                title={formatDateTime(
                                    offer.accepted_date || undefined
                                )}
                            >
                                {formatDate(offer.accepted_date || "")}
                            </td>
                            <td
                                title={formatDateTime(
                                    offer.rejected_date || undefined
                                )}
                            >
                                {formatDate(offer.rejected_date || "")}
                            </td>
                            <td
                                title={formatDateTime(
                                    offer.withdrawn_date || undefined
                                )}
                            >
                                {formatDate(offer.withdrawn_date || "")}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

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
    assignmentId: number;
}) {
    const assignments = useSelector(assignmentsSelector);
    const assignment = assignments.find((a) => a.id === assignmentId);
    const assignmentNotFound = !assignment;
    const wageChunksNotFound = !assignment?.wage_chunks;
    const dispatch = useThunkDispatch();

    React.useEffect(() => {
        if (assignmentNotFound) {
            return;
        }
        // If the assignment already has wage chunks, we don't need to refetch them.
        if (wageChunksNotFound) {
            dispatch(fetchWageChunksForAssignment({ id: assignmentId }));
        }

        // Always fetch the offer history, since details of the offers
        // may have changed without the assignment changing.
        dispatch(fetchOfferHistoryForAssignment({ id: assignmentId }));
    }, [assignmentId, dispatch, assignmentNotFound, wageChunksNotFound]);

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
                    <th>Student Number</th>
                    <td>{assignment.applicant.student_number}</td>
                </tr>
                <tr>
                    <th>Total Hours</th>
                    <td>{assignment.hours}</td>
                </tr>
                <tr>
                    <th>Offer Status</th>
                    <td className={`status ${assignment.active_offer_status}`}>
                        {capitalize(
                            assignment.active_offer_status || "No Offer"
                        )}
                    </td>
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
                <tr>
                    <th>Offer History</th>
                    <td>
                        {assignment.offers ? (
                            <OfferHistoryDetails offers={assignment.offers} />
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
    const assignments = useSelector(assignmentsSelector);
    const { selectedAssignmentIds } = useSelector<
        any,
        { selectedAssignmentIds: Number[] }
    >(offerTableSelector);
    const selectedAssignments = assignments.filter((assignment) =>
        selectedAssignmentIds.includes(assignment.id)
    );
    const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);

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

    const disabled = selectedAssignmentIds.length === 0;

    return (
        <React.Fragment>
            <ActionButton
                icon={FaSearchDollar}
                onClick={() => setDialogVisible(true)}
                title={
                    disabled
                        ? "You must select an assignment to view its details"
                        : "View details of selected assignment(s)"
                }
                disabled={disabled}
            >
                Assignment Details
            </ActionButton>
            <Modal
                show={dialogVisible}
                onHide={() => setDialogVisible(false)}
                size="xl"
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
