import React from "react";
import { matchesSelector } from "./actions";
import { useSelector } from "react-redux";
import { Modal, Button, Alert } from "react-bootstrap";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

import { Assignment, Applicant } from "../../../api/defs/types";

import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";

import {
    positionsSelector,
    applicantsSelector,
    upsertAssignment,
} from "../../../api/actions";

const DEFAULT_COLUMNS = [
    { Header: "Position Code", accessor: "positionCode" },
    { Header: "Hours", accessor: "hoursAssigned" },
    { Header: "Last Name", accessor: "applicant.last_name" },
    { Header: "First Name", accessor: "applicant.first_name" },
    { Header: "UTORid", accessor: "applicant.utorid" },
];

type StagedAssignmentData = {
    positionCode: string;
    hoursAssigned: number;
    applicant: Applicant;
};

/**
 * A button that brings up a modal allowing users to see a list of staged assignments
 * and transform them into real assignments.
 */
export function FinalizeChangesButton() {
    const [dialogVisible, setDialogVisible] = React.useState(false);

    const matches = useSelector(matchesSelector);
    const positions = useSelector(positionsSelector);
    const applicants = useSelector(applicantsSelector);

    const dispatch = useThunkDispatch();

    const stagedAssignments: StagedAssignmentData[] = React.useMemo(() => {
        const stagedAssignedMatches = matches.filter(
            (match) => match.status === "staged-assigned"
        );

        const ret: StagedAssignmentData[] = [];
        for (const match of stagedAssignedMatches) {
            const targetApplicant = applicants.find(
                (applicant) => applicant.utorid === match.utorid
            );
            if (!targetApplicant) {
                continue;
            }

            ret.push({
                positionCode: match.positionCode,
                hoursAssigned: match.hoursAssigned,
                applicant: targetApplicant,
            });
        }

        return ret;
    }, [matches, applicants]);

    function _onConfirm() {
        if (stagedAssignments.length === 0) {
            setDialogVisible(false);
            return;
        }

        for (const match of stagedAssignments) {
            const targetPosition = positions.find(
                (position) => position.position_code === match.positionCode
            );

            if (!targetPosition) {
                return;
            }

            const newAssignment: Partial<Assignment> = {
                position: targetPosition,
                hours: match.hoursAssigned,
                applicant: match.applicant,
            };

            dispatch(upsertAssignment(newAssignment));
        }
        setDialogVisible(false);
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button finalize"
                onClick={() => setDialogVisible(true)}
                disabled={stagedAssignments.length === 0}
            >
                Finalize Changes{" "}
                {stagedAssignments.length > 0
                    ? ` (${stagedAssignments.length})`
                    : ""}
            </Button>
            <Modal
                show={dialogVisible}
                dialogClassName="finalize-changes-modal"
                onHide={() => setDialogVisible(false)}
                size="lg"
            >
                <Modal.Header>
                    <Modal.Title>Finalize Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        The following assignments will be made.
                    </Alert>
                    <AdvancedFilterTable
                        columns={DEFAULT_COLUMNS}
                        data={stagedAssignments}
                        filterable={true}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setDialogVisible(false)}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={_onConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
