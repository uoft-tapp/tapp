import { Button, Modal, Spinner } from "react-bootstrap";
import { BsCheck2Square } from "react-icons/bs";
import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { useSelector } from "react-redux";
import {
    assignmentKey,
    draftAssignmentsByKeySelector,
    draftAssignmentsSelector,
    draftMatchingSlice,
} from "./state/slice";
import { NullableAssignment } from "../../../components/forms/assignment-editor";
import { deleteAssignments, upsertAssignments } from "../../../api/actions";
import { Assignment } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { generateHeaderCell } from "../../../components/table-utils";
import { FaCheck, FaEdit, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

export const finalizeModalColumn = [
    {
        Header: generateHeaderCell("Position"),
        accessor: "position_code",
        width: 200,
    },
    {
        Header: generateHeaderCell("Last Name"),
        accessor: "last_name",
        maxWidth: 120,
    },
    {
        Header: generateHeaderCell("First Name"),
        accessor: "first_name",
        maxWidth: 120,
    },
    {
        Header: generateHeaderCell("Hours"),
        accessor: "hours",
        maxWidth: 100,
    },
    {
        Header: generateHeaderCell("Action"),
        width: 300,
        accessor: "action",
    },
] as const;

/**
 * A type that contains keys whose values are the `accessor` values from `finalizeModalColumn` and whose type is `string | number | React.ReactNode`.
 */
type TableRowType = {
    [K in typeof finalizeModalColumn[number]["accessor"]]:
        | string
        | number
        | React.ReactNode;
} & { id: string | number };

export function FinalizeDraftAssignmentsButton() {
    const [showFinalizeModal, setShowFinalizeModal] = React.useState(false);

    return (
        <React.Fragment>
            <Button
                variant="outline-primary"
                title="Finalize the current draft assignments by sending them to TAPP. Note: assignments made this way will have to be withdrawn before they can be further modified."
                onClick={() => setShowFinalizeModal(true)}
            >
                <BsCheck2Square /> Finalize Draft Assignments
            </Button>
            {showFinalizeModal && (
                <FinalizeDraftAssignmentsDialog
                    show={showFinalizeModal}
                    onHide={() => setShowFinalizeModal(false)}
                />
            )}
        </React.Fragment>
    );
}

export function FinalizeDraftAssignmentsDialog(props: {
    show: boolean;
    onHide: () => void;
}) {
    const showFinalizeModal = props.show;
    const dispatch = useThunkDispatch();
    const [selected, setSelected] = React.useState<string[]>([]);
    const draftAssignments = useSelector(draftAssignmentsSelector);
    const draftAssignmentsByKey = useSelector(draftAssignmentsByKeySelector);
    const modifiedAssignments = draftAssignments.filter(
        (a) => a.draft && a.shadows && !a.deleted && a.hours !== a.shadows.hours
    );
    const deletedAssignments = draftAssignments.filter((a) => a.deleted);
    const addedAssignments = draftAssignments.filter(
        (a) => a.draft && !a.shadows && !a.deleted
    );

    const draftAssignmentsForTable: TableRowType[] = [];
    deletedAssignments.forEach((a) => {
        draftAssignmentsForTable.push({
            position_code: a.position.position_code,
            last_name: a.applicant.last_name,
            first_name: a.applicant.first_name,
            hours: a.hours,
            id: assignmentKey(a),
            action: (
                <>
                    <FaTrash className="me-2" />
                    <strong>Delete Assignment</strong>
                </>
            ),
        });
    });
    modifiedAssignments.forEach((a) => {
        draftAssignmentsForTable.push({
            position_code: a.position.position_code,
            last_name: a.applicant.last_name,
            first_name: a.applicant.first_name,
            hours: a.hours,
            id: assignmentKey(a),
            action: (
                <>
                    <FaEdit className="me-2" />
                    <strong>Update Assignment</strong>
                    {draftAssignmentsByKey.get(assignmentKey(a))?.hours !==
                    a.hours
                        ? " (hours changed)"
                        : null}
                </>
            ),
        });
    });
    addedAssignments.forEach((a) => {
        draftAssignmentsForTable.push({
            position_code: a.position.position_code,
            last_name: a.applicant.last_name,
            first_name: a.applicant.first_name,
            hours: a.hours,
            id: assignmentKey(a),
            action: (
                <>
                    <FaPlus className="me-2" />
                    <span>Create Assignment</span>
                </>
            ),
        });
    });

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const [inProgress, setInProgress] = React.useState(false);
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;

    async function finalizeDraftAssignments() {
        console.log("Finalizing draft assignments:", selected);
        const selectedAssignments = draftAssignments.filter((a) =>
            selected.includes(assignmentKey(a))
        );
        const assignmentsToUpsert: NullableAssignment[] = selectedAssignments
            .filter((a) => !a.deleted)
            .map((a) => {
                // If this is a modification of an existing assignment, we only pass the id and the new hours.
                // Otherwise we pass in the position_id and applicant_id to create a new assignment.
                if (a.shadows) {
                    return {
                        id: a.shadows.id,
                        hours: a.hours,
                    } as NullableAssignment;
                }
                return {
                    position: { id: a.position.id },
                    applicant: { id: a.applicant.id },
                    position_id: a.position.id,
                    applicant_id: a.applicant.id,
                    hours: a.hours,
                } as NullableAssignment;
            });
        // Assignments to delete are not drafts and therefore always have a valid id. We can send them to the survey directly.
        const assignmentsToDelete = selectedAssignments.filter(
            (a) => a.deleted
        );
        if (assignmentsToDelete.some((a) => a.id == null)) {
            console.error(
                "Cannot delete assignment without valid ID:",
                assignmentsToDelete
            );
            throw new Error(
                "Tried to delete an assignment, but the assignment did not have an id"
            );
        }
        setInProgress(true);
        try {
            // Delete assignments first
            await dispatch(
                deleteAssignments(assignmentsToDelete as Assignment[])
            );
            dispatch(
                draftMatchingSlice.actions.forceRemoveDraftAssignments(
                    assignmentsToDelete
                )
            );
            // Upsert assignments second
            await dispatch(
                upsertAssignments(assignmentsToUpsert as Partial<Assignment>[])
            );
            // Remove all the draft assignments that we just sent to the server
            dispatch(
                draftMatchingSlice.actions.forceRemoveDraftAssignments(
                    selectedAssignments
                )
            );
            setSelected([]);
        } finally {
            setInProgress(false);
        }
    }

    function discardSelectedDraftAssignments() {
        const selectedAssignments = draftAssignments.filter((a) =>
            selected.includes(assignmentKey(a))
        );
        dispatch(
            draftMatchingSlice.actions.forceRemoveDraftAssignments(
                selectedAssignments
            )
        );
        setSelected([]);
    }

    return (
        <Modal show={showFinalizeModal} onHide={props.onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Finalize Draft Assignments</Modal.Title>
            </Modal.Header>
            {showFinalizeModal && (
                <Modal.Body>
                    <p>
                        Below are a list of assignments that can be finalized.
                        Check which ones you want to finalize. Once finalized,
                        these assignments will be created in TAPP. Further
                        modification of the assignments must take place from the
                        main TAPP interface. They can no longer be changed in
                        the drafting interface.
                    </p>
                    <div className="mb-3">
                        <AdvancedFilterTable
                            // The ReactTable types are not smart enough to know that you can use a function
                            // for Header, so we will opt out of the type system here.
                            columns={finalizeModalColumn}
                            data={draftAssignmentsForTable}
                            setSelected={setSelected}
                            selected={selected}
                            filterable={true}
                        />
                    </div>
                </Modal.Body>
            )}
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>
                    Cancel
                </Button>
                <div className="ms-auto"></div>
                <Button
                    variant="success"
                    onClick={discardSelectedDraftAssignments}
                    disabled={selected.length === 0 || inProgress}
                    title="Discard the drafted changes. This removes the changes from the drafting view; it does not make any changes to the database."
                >
                    <FaTimes className="me-1" />
                    Revert and Discard{" "}
                    {selected.length === 0 ? (
                        "Select Assignments to Discard"
                    ) : (
                        <React.Fragment>
                            {selected.length} Assignment
                            {selected.length !== 1 ? "s" : ""}
                        </React.Fragment>
                    )}
                </Button>
                <Button
                    variant="primary"
                    onClick={finalizeDraftAssignments}
                    disabled={selected.length === 0 || inProgress}
                    title="Finalize the selected draft assignments by creating assignments in TAPP."
                >
                    {spinner}
                    <FaCheck className="me-1" />
                    {selected.length === 0 ? (
                        "Select Assignments to Finalize"
                    ) : (
                        <React.Fragment>
                            Finalize {selected.length} Assignment
                            {selected.length !== 1 ? "s" : ""}
                        </React.Fragment>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
