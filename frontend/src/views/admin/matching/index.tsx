import React from "react";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import {
    selectedMatchingPositionSelector,
    positionSummariesByIdSelector,
} from "./actions";
import { PositionSummary } from "./types";
import { PositionList } from "./position-list";
import { ApplicantView } from "./applicant-view";
import { ImportGuaranteesButton } from "./import-export/import-guarantees";
import { ImportMatchingDataButton } from "./import-export/import-matching-data";
import { ExportMatchingDataButton } from "./import-export/export-matching-data";
import { FinalizeChangesButton } from "./finalize-changes";
import "./styles.css";

export function AdminMatchingView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();

    // We don't load postings by default, so we load them dynamically whenever
    // we view this page.
    React.useEffect(() => {
        async function fetchResources() {
            return await dispatch(fetchPostings());
        }

        if (activeSession) {
            fetchResources();
        }
    }, [activeSession, dispatch]);

    // Get information about positions
    const positionSummaries = useSelector(positionSummariesByIdSelector);
    const selectedPositionId = useSelector(selectedMatchingPositionSelector);
    const selectedPositionSummary: PositionSummary | null =
        React.useMemo(() => {
            if (!selectedPositionId) {
                return null;
            }

            return positionSummaries[selectedPositionId];
        }, [selectedPositionId, positionSummaries]);

    return (
        <div className="page-body matching">
            <div className="matching-body">
                <PositionList
                    selectedPositionId={selectedPositionId}
                    positionSummaries={Object.values(positionSummaries)}
                />
                {selectedPositionSummary && (
                    <ApplicantView positionSummary={selectedPositionSummary} />
                )}
            </div>
            <div className="matching-footer page-actions">
                <ImportMatchingDataButton />
                <ImportGuaranteesButton />
                <ExportMatchingDataButton />
                <div className="footer-button-separator" />
                <FinalizeChangesButton />
            </div>
        </div>
    );
}
