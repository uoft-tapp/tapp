import React from "react";
import { Position, Application } from "../../../../../../api/defs/types";
import { ApplicantSummary } from "../../../types";
import { getApplicantMatchForPosition } from "../../../utils";
import { AdjustHourModal, ApplicationDetailModal } from "../modals";
import { GridItemDropdown } from "./dropdown";
import { GridItemStatusBar } from "./status-bar";
import { GridItemBody } from "./body";

/**
 * A grid item to be displayed in grid view, showing a summary of an applicant.
 */
export function GridItem({
    applicantSummary,
    position,
}: {
    applicantSummary: ApplicantSummary;
    position: Position;
}) {
    const [open, setOpen] = React.useState(false);
    const [shownApplication, setShownApplication] =
        React.useState<Application | null>(null);
    const [showChangeHours, setShowChangeHours] = React.useState(false);

    const match = getApplicantMatchForPosition(applicantSummary, position);

    if (!match) {
        return null;
    }

    return (
        // Entire item is marked as a dropdown trigger to access the list of actions
        <div
            className="applicant-dropdown-wrapper dropdown"
            onMouseLeave={() => setOpen(false)}
        >
            <div
                className="applicant-grid-item noselect"
                onClick={() => setOpen(!open)}
            >
                <GridItemStatusBar applicantSummary={applicantSummary} />
                <GridItemBody
                    applicantSummary={applicantSummary}
                    match={match}
                />
            </div>
            <GridItemDropdown
                match={match}
                applicantSummary={applicantSummary}
                show={open}
                setShow={setOpen}
                setShownApplication={setShownApplication}
                setShowChangeHours={setShowChangeHours}
            />
            <ApplicationDetailModal
                application={shownApplication}
                setShownApplication={setShownApplication}
            />
            <AdjustHourModal
                match={match}
                show={showChangeHours}
                setShow={setShowChangeHours}
            />
        </div>
    );
}
