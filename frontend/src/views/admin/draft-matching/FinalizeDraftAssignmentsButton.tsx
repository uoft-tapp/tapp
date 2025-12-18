import { Button, Modal, Spinner } from "react-bootstrap";
import { BsCheck2Square } from "react-icons/bs";
import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { useSelector } from "react-redux";
import { draftAssignmentsSelector, draftMatchingSlice } from "./state/slice";
import { NullableAssignment } from "../../../components/forms/assignment-editor";
import { upsertAssignments } from "../../../api/actions";
import { Assignment } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { generateHeaderCell } from "../../../components/table-utils";

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
];

export function FinalizeDraftAssignmentsButton() {
    const dispatch = useThunkDispatch();
    const [showFinalizeModal, setShowFinalizeModal] = React.useState(false);
    const [selected, setSelected] = React.useState<string[]>([]);
    const allAssignments = useSelector(draftAssignmentsSelector);
    const draftAssignmentsForTable = useSelector(draftAssignmentsSelector)
        .filter((a) => a.draft)
        .map((a) => ({
            position_code: a.position.position_code,
            last_name: a.applicant.last_name,
            first_name: a.applicant.first_name,
            hours: a.hours,
            id: `${a.position.position_code}|${a.applicant.utorid}`,
        }));

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const [inProgress, setInProgress] = React.useState(false);
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;

    async function finalizeDraftAssignments() {
        console.log("Finalizing draft assignments:", selected);
        // Create NullableAssignment objects for each selected assignment
        const draftsToUpload = allAssignments.filter((a) =>
            selected.includes(
                `${a.position.position_code}|${a.applicant.utorid}`
            )
        );
        const assignmentsToUpload: NullableAssignment[] = draftsToUpload.map(
            (a) =>
                ({
                    position: { id: a.position.id },
                    applicant: { id: a.applicant.id },
                    position_id: a.position.id,
                    applicant_id: a.applicant.id,
                    hours: a.hours,
                } as NullableAssignment)
        );
        setInProgress(true);
        try {
            await dispatch(
                upsertAssignments(assignmentsToUpload as Partial<Assignment>[])
            );
            // Remove all the draft assignments that we just sent to the server
            dispatch(
                draftMatchingSlice.actions.removeDraftAssignments(
                    draftsToUpload
                )
            );
        } finally {
            setInProgress(false);
        }

        // TODO: Implement the finalize logic
    }
    return (
        <React.Fragment>
            <Button
                variant="outline-primary"
                title="Finalize the current draft assignments by sending them to TAPP. Note: assignments made this way will have to be withdrawn before they can be further modified."
                onClick={() => setShowFinalizeModal(true)}
            >
                <BsCheck2Square /> Finalize Draft Assignments
            </Button>
            <Modal
                show={showFinalizeModal}
                onHide={() => setShowFinalizeModal(false)}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Finalize Draft Assignments</Modal.Title>
                </Modal.Header>
                {showFinalizeModal && (
                    <Modal.Body>
                        <p>
                            Below are a list of assignments that can be
                            finalized. Check which ones you want to finalize.
                            Once finalized, these assignments will be created in
                            TAPP. Further modification of the assignments must
                            take place from the main TAPP interface. They can no
                            longer be changed in the drafting interface.
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
                    <Button
                        variant="secondary"
                        onClick={() => setShowFinalizeModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={finalizeDraftAssignments}
                        disabled={selected.length === 0 || inProgress}
                    >
                        {spinner}
                        {selected.length === 0 ? (
                            "Select Assignments to Finalize"
                        ) : (
                            <React.Fragment>
                                Finalize {selected.length} Assignment
                            </React.Fragment>
                        )}
                        {selected.length !== 1 ? "s" : ""}
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
