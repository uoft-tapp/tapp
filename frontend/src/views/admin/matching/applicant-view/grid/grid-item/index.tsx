import React from "react";
import { Position, Application } from "../../../../../../api/defs/types";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { getApplicantMatchForPosition } from "../../../utils";
import { AdjustHourModal, ApplicationDetailModal } from "../modals";
import { GridItemDropdown } from "./dropdown";
import { ApplicantPillLeft } from "./status-bar";
import { ApplicantPillMiddle, ApplicantPillRight } from "./body";
import { ApplicantNoteModal } from "../modals";

import { Dropdown } from "react-bootstrap";
import DropdownToggle from "react-bootstrap/esm/DropdownToggle";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";

type CustomToggleProps = {
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {};
};

/**
 * An applicant pill that displays a short summary of all data associated with a specific applicant.
 */
const ApplicantPill = React.forwardRef(function ApplicantPill(
    {
        applicantSummary,
        match,
        onClick,
    }: {
        applicantSummary: ApplicantSummary;
        match: MatchableAssignment | null;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    },
    ref: React.Ref<HTMLButtonElement>
) {
    if (!match) {
        return (
            <button ref={ref} className="applicant-pill" onClick={onClick}>
                <ApplicantPillLeft applicantSummary={applicantSummary} />
            </button>
        );
    }
    return (
        <button ref={ref} className="applicant-pill" onClick={onClick}>
            <ApplicantPillLeft applicantSummary={applicantSummary} />
            <ApplicantPillMiddle
                applicantSummary={applicantSummary}
                match={match}
            />
            <ApplicantPillRight
                applicantSummary={applicantSummary}
                match={match}
            />
        </button>
    );
});

/**
 * A grid item to be displayed in grid view, showing a summary of an applicant.
 */
export function ConnectedApplicantPill({
    applicantSummary,
    position,
}: {
    applicantSummary: ApplicantSummary;
    position: Position;
}) {
    const [shownApplication, setShownApplication] =
        React.useState<Application | null>(null);
    const [showChangeHours, setShowChangeHours] = React.useState(false);
    const [showApplicantNote, setShowApplicantNote] = React.useState(false);

    const match = getApplicantMatchForPosition(applicantSummary, position);
    const boundApplicantButton = React.useMemo(
        () =>
            React.forwardRef(
                (
                    props: CustomToggleProps,
                    ref: React.Ref<HTMLButtonElement>
                ) => (
                    <ApplicantPill
                        ref={ref}
                        onClick={(e) => {
                            e.preventDefault();
                            if (props.onClick) {
                                props.onClick(e);
                            }
                        }}
                        applicantSummary={applicantSummary}
                        match={match}
                    />
                )
            ),
        [applicantSummary, match]
    );

    if (!match) {
        return null;
    }

    return (
        <>
            <Dropdown>
                <DropdownToggle as={boundApplicantButton} />
                <DropdownMenu>
                    <GridItemDropdown
                        match={match}
                        applicantSummary={applicantSummary}
                        setShownApplication={setShownApplication}
                        setShowChangeHours={setShowChangeHours}
                        setShowNote={setShowApplicantNote}
                    />
                </DropdownMenu>
            </Dropdown>
            <ApplicationDetailModal
                application={shownApplication}
                setShownApplication={setShownApplication}
            />
            <AdjustHourModal
                match={match}
                show={showChangeHours}
                setShow={setShowChangeHours}
            />
            <ApplicantNoteModal
                applicantSummary={applicantSummary}
                show={showApplicantNote}
                setShow={setShowApplicantNote}
            />
        </>
    );
}
