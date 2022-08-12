import React from "react";
import { ApplicantSummary, PositionSummary, MatchStatus } from "../types";
import { defaultSortList } from "../sorts";
import { applySorts, SortListItem } from "../sorts/sorts";
import { applyFilters, FilterListItem } from "../filters/filters";
import { defaultFilterList } from "../filters";
import { ApplicantViewHeader } from "./header";
import { ApplicantViewBody } from "./body";

// Mapping of status strings to better human-readable text
export const matchingStatusToString: Record<MatchStatus, string> = {
    assigned: "Assigned",
    "staged-assigned": "Assigned (Staged)",
    applied: "Applied",
    starred: "Starred",
    hidden: "Hidden",
};

export function ApplicantView({
    positionSummary,
}: {
    positionSummary: PositionSummary;
}) {
    const [filterString, setFilterString] = React.useState("");
    const [sortList, setSortList] =
        React.useState<SortListItem[]>(defaultSortList);

    const [filterList, setFilterList] =
        React.useState<FilterListItem[]>(defaultFilterList);

    const filteredApplicants: ApplicantSummary[] = React.useMemo(() => {
        return applyFiltersAndSort(
            positionSummary,
            filterString,
            filterList,
            sortList
        );
    }, [filterString, sortList, filterList, positionSummary]);

    return (
        <div className="matching-course-main">
            <ApplicantViewHeader
                positionSummary={positionSummary}
                setFilterString={setFilterString}
                filterList={filterList}
                setFilterList={setFilterList}
                sortList={sortList}
                setSortList={setSortList}
            />
            <ApplicantViewBody
                positionSummary={positionSummary}
                applicantSummaries={filteredApplicants}
            />
        </div>
    );
}

function applyFiltersAndSort(
    positionSummary: PositionSummary,
    filterString: string,
    filterList: FilterListItem[],
    sortList: SortListItem[]
) {
    // Apply search value filter
    const filteredBySearch = positionSummary.applicantSummaries.filter(
        (applicantSummary) =>
            `${applicantSummary.applicant.first_name} ${applicantSummary.applicant.last_name} ${applicantSummary.applicant.utorid}`
                .toLowerCase()
                .includes(filterString.toLowerCase())
    );

    // Apply filters based on filter list
    const filteredByFilters: ApplicantSummary[] =
        applyFilters(filteredBySearch, filterList, positionSummary.position) ||
        [];

    // Apply sorts based on sort lists
    return applySorts(filteredByFilters, sortList, positionSummary.position);
}
