import React from "react";
import { ApplicantSummary } from "../../../types";
import { RiStickyNoteFill } from "react-icons/ri";
import { ApplicantNoteModal } from "../../../modals/applicant-note";

/**
 * A button that displays a dialog allowing one to edit an applicant's notes.
 */
export function ApplicantNote({
    applicantSummary,
}: {
    applicantSummary: ApplicantSummary;
}) {
    const [showApplicantNote, setShowApplicantNote] = React.useState(false);

    return (
        <>
            <RiStickyNoteFill
                title="View or edit this applicant's note"
                className={`applicant-icon ${
                    applicantSummary.note && applicantSummary.note.length > 0
                        ? "active"
                        : "inactive"
                }`}
                onClick={() => setShowApplicantNote(true)}
            />
            <ApplicantNoteModal
                applicantSummary={applicantSummary}
                show={showApplicantNote}
                setShow={setShowApplicantNote}
            />
        </>
    );
}
