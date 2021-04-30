import React from "react";
import { FaDownload } from "react-icons/fa";
import { Ddah } from "../../../api/defs/types";
import { ActionButton } from "../../../components/action-buttons";
import { DdahConfirmationDialog } from "./ddah-confirmation-dialog";
import JSZip from "jszip";
import FileSaver from "file-saver";

/**
 * Get the public url to download a DDAH
 *
 * @param {Ddah} ddah
 * @returns
 */
function ddahUrl(ddah: Ddah) {
    const url = new URL(window.location.origin);
    url.pathname = `/public/ddahs/${ddah.url_token}.pdf`;
    return url.href;
}

/**
 * Convert a ddah into a filename
 *
 * @param {Ddah} ddah
 * @returns
 */
function ddahToFilename(ddah: Ddah) {
    return `${ddah.assignment.position.position_code}-DDAH-${ddah.assignment.applicant.last_name}.pdf`;
}

export function DownloadDdahs({ selectedDdahs }: { selectedDdahs: Ddah[] }) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    async function downloadDdahs() {
        const fetches = await Promise.all(
            selectedDdahs.map((ddah) =>
                Promise.all([fetch(ddahUrl(ddah)), ddahToFilename(ddah)])
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
        FileSaver.saveAs(allDdahsBlob, "All-DDAH-PDFs.zip");
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaDownload}
                disabled={selectedDdahs.length === 0}
                onClick={() => setShowConfirmation(true)}
                title={"Download PDF copies of selected DDAHs"}
            >
                Download PDFs
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={downloadDdahs}
                title="Download DDAH PDFs"
                body={`Download PDFs of the following ${selectedDdahs.length} DDAHs.`}
                confirmation={"Download"}
            />
        </React.Fragment>
    );
}
