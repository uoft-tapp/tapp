import React from "react";
import { useSelector } from "react-redux";
import { viewTypeSelector } from "../actions";
import { ApplicantSummary, PositionSummary } from "../types";
import { TableView } from "./table/table-view";
import { GridView } from "./grid/grid-view";

/**
 * The main body of the applicant view containing a list of all applicant summaries
 * for a particular position, presented in either a table or grid view.
 */
export function ApplicantViewBody({
    positionSummary,
    applicantSummaries,
}: {
    positionSummary: PositionSummary;
    applicantSummaries: ApplicantSummary[];
}) {
    const viewType = useSelector(viewTypeSelector);

    // A string to be displayed at the bottom of the body summarizing how many
    // applications are visible vs. hidden
    const applicantCountString: string = React.useMemo(() => {
        const numVisible = applicantSummaries.length;
        const numTotalApplicants = positionSummary.applicantSummaries.length;
        const numHidden =
            positionSummary.applicantSummaries.length -
            applicantSummaries.length;

        let ret = `Showing ${numVisible}/${numTotalApplicants} applicants`;
        if (numHidden > 0) {
            ret += ` (${numHidden} hidden)`;
        }

        return ret;
    }, [positionSummary, applicantSummaries]);

    return (
        <div className="matching-course-body">
            {viewType === "table" ? (
                <TableView
                    position={positionSummary.position}
                    applicantSummaries={applicantSummaries}
                />
            ) : (
                <GridView
                    position={positionSummary.position}
                    applicantSummaries={applicantSummaries}
                />
            )}
            <div className="applicant-count">{applicantCountString}</div>
        </div>
    );
}
