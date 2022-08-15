import React from "react";
import { Position, Application } from "../../../../../../api/defs/types";
import { ApplicantSummary } from "../../../types";
import { getApplicantMatchForPosition } from "../../../utils";
import { AdjustHourModal, ApplicationDetailModal } from "../modals";
import { GridItemDropdown } from "./dropdown";
import { GridItemStatusBar } from "./status-bar";
import { GridItemBody } from "./body";

import { Dropdown } from "react-bootstrap";

type CustomToggleProps = {
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {};
};

type CustomMenuProps = {
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    labeledBy?: string;
};

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

    const CustomToggle = React.forwardRef(
        (props: CustomToggleProps, ref: React.Ref<HTMLDivElement>) => (
            <div
                ref={ref}
                className="applicant-grid-item noselect"
                onClick={(e) => {
                    e.preventDefault();
                    if (props.onClick) props.onClick(e);
                    setOpen(!open);
                }}
            >
                <GridItemStatusBar applicantSummary={applicantSummary} />
                <GridItemBody
                    applicantSummary={applicantSummary}
                    match={match}
                />
            </div>
        )
    );

    const CustomMenu = React.forwardRef(
        (props: CustomMenuProps, ref: React.Ref<HTMLDivElement>) => {
            return (
                <div
                    ref={ref}
                    style={props.style}
                    className={props.className}
                    aria-labelledby={props.labeledBy}
                >
                    <GridItemDropdown
                        match={match}
                        applicantSummary={applicantSummary}
                        setShownApplication={setShownApplication}
                        setShowChangeHours={setShowChangeHours}
                    />
                </div>
            );
        }
    );

    return (
        <>
            <Dropdown>
                <Dropdown.Toggle as={CustomToggle} />
                <Dropdown.Menu
                    as={CustomMenu}
                    className="applicant-dropdown-menu"
                />
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
        </>
    );
}
