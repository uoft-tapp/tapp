import React from "react";
import { FaDownload } from "react-icons/fa";
import { Assignment } from "../../../api/defs/types";
import { ActionButton } from "../../../components/action-buttons";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";

/**
 * Get the public url to download an Assignment
 *
 */
function offerUrl(assignment: Assignment) {
    const url = new URL(window.location.origin);
    url.pathname = `/public/contracts/${assignment.active_offer_url_token}.pdf`;
    return url.href;
}

/**
 * Convert an Assignment into a filename
 *
 */
function assignmentToFilename(assignment: Assignment) {
    const fileName = `${assignment.applicant.last_name}, ${assignment.applicant.first_name}_${assignment.position.position_code}.pdf`;
    // Escape characters that are not allowed in a file name
    // Code from https://stackoverflow.com/questions/42210199/remove-illegal-characters-from-a-file-name-but-leave-spaces
    return fileName.replace(/[/\\?%*:|"<>]/g, '-');
}

export function DownloadOfferPdfs({
    selectedAssignments,
}: {
    selectedAssignments: Assignment[];
}) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    let disabledString = "";
    if (selectedAssignments.length === 0) {
        disabledString = " (Cannot download offers until some are selected)";
    } else if (
        selectedAssignments.some(
            (assignment) => !assignment.active_offer_status
        )
    ) {
        disabledString = " (Some selected assignments do not have offers)";
    }

    async function downloadOffers() {
        const fetches = await Promise.all(
            selectedAssignments.map((assignment) =>
                Promise.all([
                    fetch(offerUrl(assignment)),
                    assignmentToFilename(assignment),
                ])
            )
        );
        const blobs = await Promise.all(
            fetches.map(([request, filename]) =>
                Promise.all([request.blob(), filename])
            )
        );
        const zip = new JSZip();

        for (const [blob, filename] of blobs) {
            zip.file(filename, blob);
        }
        const allDdahsBlob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(allDdahsBlob, "All-Offer-PDFs.zip");
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaDownload}
                disabled={!!disabledString}
                onClick={() => setShowConfirmation(true)}
                title={"Download PDF copies of selected offers" + disabledString}
            >
                Download PDFs
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={downloadOffers}
                title="Download offer PDFs"
                body={`Download PDFs of the following ${selectedAssignments.length} offers.`}
                confirmation={"Download"}
            />
        </React.Fragment>
    );
}
