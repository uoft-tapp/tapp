import { ApplicantSummary } from "../types";
import { Position } from "../../../../api/defs/types";
import {
    getPositionPrefForPosition,
    getApplicantMatchForPosition,
} from "../utils";

export type FilterType =
    | "program"
    | "department"
    | "taPositionPref"
    | "status"
    | "hourFulfillment";

export const filterMap: Record<
    FilterType,
    {
        label: string;
        func: Function;
        values: { label: string; value: any }[];
        hasOther: boolean;
    }
> = {
    program: {
        label: "Program",
        func: filterByProgram,
        values: [
            { label: "Postdoc (PD)", value: "PD" },
            { label: "PhD (P)", value: "P" },
            { label: "Masters (M)", value: "M" },
            { label: "MScAC (m)", value: "MScAC" },
            { label: "Undergraduate (U)", value: "U" },
        ],
        hasOther: true,
    },
    department: {
        label: "Department",
        func: filterByDept,
        values: [
            { label: "Mathematics/Applied Mathematics (M)", value: "math" },
            { label: "Computer Science (CS)", value: "cs" },
            { label: "Engineering (E)", value: "engr" },
            { label: "Astronomy and Astrophysics (A)", value: "astro" },
            { label: "Chemistry (Ch)", value: "chem" },
            { label: "Medical Biophysics (B)", value: "biophys" },
            { label: "Physics (P)", value: "phys" },
            { label: "Statistics (S)", value: "stat" },
        ],
        hasOther: true,
    },
    taPositionPref: {
        label: "TA Preference",
        func: filterByTaPref,
        values: [
            { label: "High", value: 3 },
            { label: "Medium", value: 2 },
            { label: "Low", value: 1 },
            { label: "N/A", value: 0 },
            { label: "Strong Preference Against", value: -1 },
        ],
        hasOther: true,
    },
    status: {
        label: "Position Status",
        func: filterByPositionStatus,
        values: [
            { label: "Assigned", value: "assigned" },
            { label: "Assigned (Staged)", value: "staged-assigned" },
            { label: "Starred", value: "starred" },
            { label: "Applied", value: "applied" },
            { label: "Unassignable", value: "unassignable" },
            { label: "Hidden", value: "hidden" },
        ],
        hasOther: false,
    },
    hourFulfillment: {
        label: "Hour Fulfillment",
        func: filterByHourFulfillment,
        values: [
            { label: "Overfilled", value: "over" },
            { label: "Filled", value: "matched" },
            { label: "Underfilled", value: "under" },
            { label: "Empty", value: "empty" },
            { label: "N/A", value: "n/a" },
        ],
        hasOther: false,
    },
};

/**
 * Returns a copy of `applicantSummaries` with filters applied, specified by `filterList`.
 */
export function applyFilters(
    applicantSummaries: ApplicantSummary[],
    filterList: Record<FilterType, any[]>,
    position: Position | null
) {
    if (Object.keys(filterList).length === 0 || !position) {
        return [...applicantSummaries];
    }

    let filteredList: ApplicantSummary[] = [...applicantSummaries];
    for (const key in filterList) {
        if (key === "taPositionPref" || key === "status") {
            filteredList = filterMap[key as FilterType].func(
                filteredList,
                filterList[key as FilterType],
                position
            );
        } else {
            filteredList = filterMap[key as FilterType].func(
                filteredList,
                filterList[key as FilterType]
            );
        }
    }

    return filteredList;
}

/**
 * Returns true if the value is considered to belong to the "other" group for a given filter type.
 */
function checkIsOther(filterType: FilterType, value: any) {
    for (const values of filterMap[filterType].values) {
        if (values.value === value) {
            return false;
        }
    }

    return true;
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

    return applicantSummaries.filter((applicantSummary) => {
        const program = applicantSummary?.application?.program || "";
        if (excludeValues.includes(program)) {
            return false;
        }

        if (
            excludeValues.includes("other") &&
            checkIsOther("program", program)
        ) {
            return false;
        }

        return true;
    });
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

    return applicantSummaries.filter((applicantSummary) => {
        const dept = applicantSummary?.application?.department || "";
        if (excludeValues.includes(dept)) {
            return false;
        }

        if (
            excludeValues.includes("other") &&
            checkIsOther("department", dept)
        ) {
            return false;
        }

        return true;
    });
}

/**
 * Returns a filtered list of applicant summaries based on each applicant's preference level for a position.
 */
function filterByTaPref(
    applicantSummaries: ApplicantSummary[],
    excludeValues: any[],
    position: Position
) {
    if (
        applicantSummaries.length === 0 ||
        excludeValues.length === 0 ||
        !position
    ) {
        return applicantSummaries;
    }

    return applicantSummaries.filter((applicantSummary) => {
        let pref: number | null = null;
        if (applicantSummary.application) {
            const positionPref = getPositionPrefForPosition(
                applicantSummary.application,
                position
            );

            if (positionPref) {
                pref = positionPref.preference_level;
            }
        }

        if (excludeValues.includes("other") && pref === null) {
            return false;
        }

        if (excludeValues.includes(pref)) {
            return false;
        }

        return true;
    });
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

    return applicantSummaries.filter((applicantSummary) => {
        const match = getApplicantMatchForPosition(applicantSummary, position);

        if (!match || excludeValues.includes(match.status)) {
            return false;
        }

        return true;
    });
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

    return applicantSummaries.filter(
        (applicantSummary) =>
            !excludeValues.includes(applicantSummary.filledStatus)
    );
}
