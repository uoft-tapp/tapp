import { ApplicantSummary } from "../types";
import { Position } from "../../../../api/defs/types";
import {
    getPositionPrefForPosition,
    getApplicantMatchForPosition,
    getApplicantTotalHoursAssigned,
} from "../utils";

export type FilterListItem = {
    section: string;
    value: string;
};

export type FilterMapItem = {
    filterFunc: Function;
    values: FilterMapItemValue[];
};

export type FilterMapItemValue = {
    value: any;
    label: string;
};

export const filterMap: Record<string, FilterMapItem> = {
    Program: {
        filterFunc: filterByProgram,
        values: [
            {
                value: "PD",
                label: "Postdoc",
            },
            {
                value: "P",
                label: "PhD",
            },
            {
                value: "M",
                label: "Masters",
            },
            {
                value: "MScAC",
                label: "MScAC",
            },
            {
                value: "U",
                label: "Undergraduate",
            },
            {
                value: "Other",
                label: "Other",
            },
        ],
    },
    Department: {
        filterFunc: filterByDept,
        values: [
            {
                value: "math",
                label: "Mathematics/Applied Mathematics",
            },
            {
                value: "cs",
                label: "Computer Science",
            },
            {
                value: "engr",
                label: "Engineering",
            },
            {
                value: "astro",
                label: "Astronomy and Astrophysics",
            },
            {
                value: "chem",
                label: "Chemistry",
            },
            {
                value: "biophys",
                label: "Medical Biophysics",
            },
            {
                value: "phys",
                label: "Physics",
            },
            {
                value: "stat",
                label: "Statistics",
            },
        ],
    },
    "TA Preference": {
        filterFunc: filterByTaPref,
        values: [
            {
                value: 3,
                label: "High",
            },
            {
                value: 2,
                label: "Medium",
            },
            {
                value: 1,
                label: "Low",
            },
            {
                value: 0,
                label: "N/A",
            },
            {
                value: -1,
                label: "Strong Preference Against",
            },
        ],
    },
    "Position Status": {
        filterFunc: filterByPositionStatus,
        values: [
            {
                value: "assigned",
                label: "Assigned",
            },
            {
                value: "staged-assigned",
                label: "Assigned (Staged)",
            },
            {
                value: "starred",
                label: "Starred",
            },
            {
                value: "applied",
                label: "Applied",
            },
            {
                value: "hidden",
                label: "Hidden",
            },
        ],
    },
    "Hour Fulfillment": {
        filterFunc: filterByHourFulfillment,
        values: [
            {
                value: "over",
                label: "Overfilled",
            },
            {
                value: "filled",
                label: "Filled",
            },
            {
                value: "under",
                label: "Underfilled",
            },
            {
                value: "empty",
                label: "Unstarted",
            },
            {
                value: "N/A",
                label: "N/A",
            },
        ],
    },
};

/**
 * Returns a copy of `applicantSummaries` with filters applied, specified by `filterList`.
 */
export function applyFilters(
    applicantSummaries: ApplicantSummary[],
    filterList: FilterListItem[],
    position: Position | null
) {
    if (filterList.length === 0 || !position) {
        return [...applicantSummaries];
    }

    let filteredList: ApplicantSummary[] = [...applicantSummaries];

    // Create buckets
    const filterBuckets: Record<string, string[]> = {};

    for (const filterItem of filterList) {
        const bucket = filterBuckets[filterItem.section] || [];
        bucket.push(filterItem.value);
        filterBuckets[filterItem.section] = bucket;
    }

    // Apply filters for each type
    for (const key in filterBuckets) {
        // Return early if this key doesn't exist in the filter map for some reason
        if (!filterMap[key]) {
            return;
        }

        if (key === "TA Preference" || key === "Position Status") {
            filteredList = filterMap[key].filterFunc(
                filteredList,
                filterBuckets[key],
                position
            );
        } else {
            // Call the section's filter function
            filteredList = filterMap[key].filterFunc(
                filteredList,
                filterBuckets[key]
            );
        }
    }

    return filteredList;
}

/**
 * Returns a filtered list of applicant summaries based on which program applicants belong to.
 */
function filterByProgram(
    applicantSummaries: ApplicantSummary[],
    excludeValues: string[]
) {
    if (excludeValues.length === 0) {
        return applicantSummaries;
    }

    return applicantSummaries.filter(
        (applicantSummary) =>
            !excludeValues.includes(
                applicantSummary?.application?.program || ""
            )
    );
}

/**
 * Returns a filtered list of applicant summaries based on which department applicants belong to.
 */
function filterByDept(
    applicantSummaries: ApplicantSummary[],
    excludeValues: string[]
) {
    if (excludeValues.length === 0) {
        return applicantSummaries;
    }

    return applicantSummaries.filter(
        (applicantSummary) =>
            !excludeValues.includes(
                applicantSummary?.application?.department || ""
            )
    );
}

/**
 * Returns a filtered list of applicant summaries based on each applicant's preference level for a position.
 */
function filterByTaPref(
    applicantSummaries: ApplicantSummary[],
    excludeValues: number[],
    position: Position
) {
    if (
        applicantSummaries.length === 0 ||
        excludeValues.length === 0 ||
        !position
    ) {
        return applicantSummaries;
    }

    return (
        applicantSummaries
            .map((applicantSummary) => {
                // Get the applicant's preference for this position
                if (!applicantSummary.application) {
                    return null;
                }

                const applicantPref = getPositionPrefForPosition(
                    applicantSummary.application,
                    position
                );

                if (
                    !applicantPref ||
                    excludeValues.includes(applicantPref.preference_level)
                ) {
                    return null;
                }

                return applicantSummary;
            })
            .filter((applicantSummary) => applicantSummary !== null) || []
    );
}

/**
 * Returns a filtered list of applicant summaries based on their matching status for the position.
 */
function filterByPositionStatus(
    applicantSummaries: ApplicantSummary[],
    excludeValues: string[],
    position: Position
) {
    if (
        applicantSummaries.length === 0 ||
        excludeValues.length === 0 ||
        !position
    ) {
        return applicantSummaries;
    }

    return applicantSummaries
        .map((applicantSummary) => {
            const match = getApplicantMatchForPosition(
                applicantSummary,
                position
            );
            if (!match || excludeValues.includes(match.status)) {
                return null;
            }

            return applicantSummary;
        })
        .filter((applicantSummary) => applicantSummary !== null);
}

/**
 * Returns a filtered list of applicant summaries based on the completeness of their appointment guarantees.
 */
function filterByHourFulfillment(
    applicantSummaries: ApplicantSummary[],
    excludeValues: string[]
) {
    if (applicantSummaries.length === 0 || excludeValues.length === 0) {
        return applicantSummaries;
    }

    return applicantSummaries
        .map((applicantSummary) => {
            let applicantHourStatus = "N/A";

            if (
                applicantSummary.guarantee &&
                applicantSummary.guarantee.totalHoursOwed > 0
            ) {
                const totalHoursAssigned =
                    getApplicantTotalHoursAssigned(applicantSummary) +
                    applicantSummary.guarantee.previousHoursFulfilled;
                if (
                    totalHoursAssigned >
                    applicantSummary.guarantee.totalHoursOwed
                ) {
                    applicantHourStatus = "over";
                } else if (
                    totalHoursAssigned ===
                    applicantSummary.guarantee.totalHoursOwed
                ) {
                    applicantHourStatus = "filled";
                } else if (totalHoursAssigned > 0) {
                    applicantHourStatus = "under";
                } else if (totalHoursAssigned === 0) {
                    applicantHourStatus = "empty";
                }
            }

            if (excludeValues.includes(applicantHourStatus)) {
                return null;
            }

            return applicantSummary;
        })
        .filter((applicantSummary) => applicantSummary !== null);
}
