import { DragAndDropInterface } from "./drag-and-drop-interface";

import "./draft-matching.css";
import { Button } from "react-bootstrap";
import { BsDownload, BsUpload } from "react-icons/bs";
import React from "react";
import { FinalizeDraftAssignmentsButton } from "./FinalizeDraftAssignmentsButton";

/**
 * Matching view for drafting assignments. This is mainly used by the Math department.
 */
export function AdminDraftMatchingView() {
    return (
        <div className="page-body matching">
            <div className="matching-body">
                <DragAndDropInterface />
            </div>
            <div className="matching-footer page-actions">
                <DownloadDraftAssignmentsButton />
                <UploadDraftAssignmentsButton />
                <div className="footer-button-separator" />
                <FinalizeDraftAssignmentsButton />
            </div>
        </div>
    );
}

function DownloadDraftAssignmentsButton() {
    return (
        <Button
            variant="outline-primary"
            title="Save draft data for archiving or for reusing later"
        >
            <BsDownload /> Export Draft Data
        </Button>
    );
}
function UploadDraftAssignmentsButton() {
    return (
        <Button
            variant="outline-primary"
            title="Import data into the drafting interface (e.g., subsequent appointment data or a previous draft)"
        >
            <BsUpload /> Import Draft Data
        </Button>
    );
}
