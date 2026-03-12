import { useSelector } from "react-redux";
import { Applicant } from "../../../../api/defs/types";
import { ApplicantPill } from "./ApplicantPill";
import {
    AssignmentDraft,
    DraftMatchingState,
    activeApplicantUtoridSelector,
    desiredHoursByUtoridSelector,
    filtersSelector,
    hideListSelector,
    showListSelector,
} from "../state/slice";
import React from "react";
import { Button } from "react-bootstrap";
import { BsFilter } from "react-icons/bs";
import { MergedApplication } from "./mergeApplications";
import { FiltersDialog } from "./FiltersDialog";

const PROGRAM_TO_NUM: Record<any, number> = {
    M: -3,
    P: -2,
    U: -1,
};
export const collator = new Intl.Collator("en", { sensitivity: "base" });

/**
 * Find a substring in a string in a locale aware way (I.e., ignore accents)
 */
function localeIncludes(haystack: string, needle: string): boolean {
    const query = needle.trim();
    if (query.length === 0) return true;

    const h = Array.from(haystack);
    const n = Array.from(query);

    if (n.length > h.length) return false;

    for (let i = 0; i <= h.length - n.length; i++) {
        const candidate = h.slice(i, i + n.length).join("");
        if (collator.compare(candidate, query) === 0) {
            return true;
        }
    }
    return false;
}

/**
 * Filterable list of applicants to drag from when making assignments in the draft matching interface.
 */
export function ApplicantList({
    applicants,
    applicationByUtorid,
    assignmentsByUtorid,
}: {
    applicants: Applicant[];
    applicationByUtorid: Map<string, MergedApplication>;
    assignmentsByUtorid: Map<string, AssignmentDraft[]>;
}) {
    const showList = useSelector(showListSelector);
    const showListSet = React.useMemo(() => new Set(showList), [showList]);
    const hideList = useSelector(hideListSelector);
    const hideListSet = React.useMemo(() => new Set(hideList), [hideList]);
    const desiredHoursByUtorid = useSelector(desiredHoursByUtoridSelector);
    const activeApplicantUtorid = useSelector(activeApplicantUtoridSelector);
    const [filterString, setFilterString] = React.useState("");
    const [filtersDialogOpen, setFiltersDialogOpen] = React.useState(false);
    const filters = useSelector(filtersSelector);
    const numActiveFilters =
        +Boolean(filters.hiddenDepartments.length) +
        +Boolean(filters.hiddenPrograms.length) +
        +Boolean(filters.hiddenPostings.length) +
        +Boolean(filters.hiddenExperienceLevels.length) +
        +Boolean(filters.hideMinimumHoursBelow);

    applicants = React.useMemo(() => {
        return [...applicants]
            .filter((applicant) => {
                let show = true;
                // If there is a non-empty show list, only show applicants on the show list.
                if (showListSet.size > 0) {
                    show = showListSet.has(applicant.utorid);
                }
                if (hideListSet.has(applicant.utorid)) {
                    show = false;
                }
                if (!show) {
                    return false;
                }
                // Test the name, utorid against the filter string.
                if (filterString.trim().length > 0) {
                    const searchable = `${applicant.first_name} ${applicant.last_name} ${applicant.utorid}`;
                    show = localeIncludes(searchable, filterString);
                }
                return show;
            })
            .filter((applicant) =>
                filterApplicant(
                    applicant,
                    applicationByUtorid,
                    desiredHoursByUtorid,
                    filters
                )
            )
            .sort((a, b) => {
                // Show Masters first, then PhDs, then undergrads. In each group sort by yip and then by name.
                const aApp = applicationByUtorid.get(a.utorid);
                const bApp = applicationByUtorid.get(b.utorid);
                if (!aApp || !bApp) {
                    return 0;
                }
                // Program order: M > P > U > anything else
                if (aApp.program !== bApp.program) {
                    return (
                        (PROGRAM_TO_NUM[aApp.program!] || 0) -
                        (PROGRAM_TO_NUM[bApp.program!] || 0)
                    );
                }
                // Sort by year next
                if (aApp.yip !== bApp.yip) {
                    return (aApp.yip || 0) - (bApp.yip || 0);
                }
                // Finally, sort by name
                const aName = `${a.first_name} ${a.last_name}`;
                const bName = `${b.first_name} ${b.last_name}`;
                return collator.compare(aName, bName);
            });
    }, [
        applicants,
        showListSet,
        hideListSet,
        filterString,
        filters,
        applicationByUtorid,
        desiredHoursByUtorid,
    ]);

    return (
        <div className="panel applicants-list">
            <div className="search-container">
                <div className="form-inline">
                    <input
                        className="form-control me-sm-2 search-bar"
                        type="text"
                        placeholder="Filter by name/UTORid..."
                        value={filterString}
                        onChange={(e) => setFilterString(e.target.value)}
                    />
                </div>
                <Button
                    className="mx-2"
                    variant={numActiveFilters > 0 ? "secondary" : "light"}
                    onClick={() => setFiltersDialogOpen(true)}
                >
                    <BsFilter className="me-2" />
                    Filters
                    {numActiveFilters > 0 && ` (${numActiveFilters} Active)`}
                </Button>
            </div>
            {applicants
                .filter((applicant) => {
                    // If there is a non-empty show list, only show applicants on the show list.
                    if (showListSet.size > 0) {
                        return showListSet.has(applicant.utorid);
                    }
                    if (hideListSet.has(applicant.utorid)) {
                        return false;
                    }
                    return true;
                })
                .map((applicant) => (
                    <ApplicantPill
                        key={applicant.id}
                        applicant={applicant}
                        application={applicationByUtorid.get(applicant.utorid)}
                        allAssignments={assignmentsByUtorid.get(
                            applicant.utorid
                        )}
                        isActive={activeApplicantUtorid === applicant.utorid}
                        parent={{ source: "applicant-list" }}
                        additionalInfo={{
                            minHours:
                                desiredHoursByUtorid[applicant.utorid]
                                    ?.minHours,
                            maxHours:
                                desiredHoursByUtorid[applicant.utorid]
                                    ?.maxHours,
                        }}
                    />
                ))}
            <FiltersDialog
                show={filtersDialogOpen}
                onClose={() => setFiltersDialogOpen(false)}
                applicationByUtorid={applicationByUtorid}
                assignmentsByUtorid={assignmentsByUtorid}
            />
        </div>
    );
}

/**
 * Determines whether an applicant should be shown based on the supplied filters.
 */
function filterApplicant(
    applicant: Applicant,
    applicationsByUtorid: Map<string, MergedApplication>,
    desiredHoursByUtorid: Record<
        string,
        { minHours?: number; maxHours?: number }
    >,
    filters: DraftMatchingState["filters"]
): boolean {
    const application = applicationsByUtorid.get(applicant.utorid);
    if (!application) {
        // If we don't have an application, we cannot apply any filters.
        return true;
    }
    // Check if their department is hidden
    if (filters.hiddenDepartments.includes(application.department || "")) {
        return false;
    }
    // Check if their program is hidden
    if (
        filters.hiddenPrograms.includes((application.program as any) || "Other")
    ) {
        return false;
    }
    // Check if their posting is hidden
    if (
        application.mergedFrom.every((app) =>
            filters.hiddenPostings.includes(app.name)
        )
    ) {
        return false;
    }
    // Check if they should be hidden based on experience
    if (
        filters.hiddenExperienceLevels.some(
            (level) =>
                (level === "department-experience" &&
                    application.previous_department_ta) ||
                (level === "university-experience" &&
                    application.previous_university_ta &&
                    !application.previous_department_ta) ||
                (level === "new-ta" &&
                    !application.previous_university_ta &&
                    !application.previous_department_ta)
        )
    ) {
        return false;
    }
    if (filters.hideMinimumHoursBelow > 0) {
        const desiredHours = desiredHoursByUtorid[applicant.utorid];
        if (
            !desiredHours ||
            desiredHours.minHours == null ||
            desiredHours.minHours < filters.hideMinimumHoursBelow
        ) {
            return false;
        }
    }

    return true;
}
