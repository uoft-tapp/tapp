import { Modal, Button, Form } from "react-bootstrap";
import { Position } from "../../../../api/defs/types";
import { ApplicantSummary } from "../types";
import {
    getPositionPrefForPosition,
    getApplicantMatchForPosition,
    getApplicantTotalHoursAssigned,
} from "../utils";

export type FilterListItem = {
    section: string;
    value: string;
};

type FilterMapItem = {
    filterFunc: Function;
    values: FilterMapItemValue[];
};

type FilterMapItemValue = {
    value: any;
    label: string;
};

export const defaultFilterList: FilterListItem[] = [
    {
        section: "Position Status",
        value: "hidden",
    },
];

const filterMap: Record<string, FilterMapItem> = {
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
 * A single checkbox item that will add or remove a filter item from "filterList" via "setFilterList".
 */
function FilterCheckbox({
    value,
    label,
    section,
    filterList,
    setFilterList,
}: {
    value: string;
    label: string;
    section: string;
    filterList: FilterListItem[];
    setFilterList: Function;
}) {
    // Mark as unchecked if this item is in the filter list
    const filterListIndex = filterList.findIndex(
        (item) => item.section === section && item.value === value
    );

    return (
        <Form.Check
            key={value}
            id="default-checkbox"
            type="checkbox"
            label={label}
            defaultChecked={filterListIndex === -1}
            onChange={() => {
                let newFilterList = [...filterList];
                if (filterListIndex === -1) {
                    // Previously checked, now unchecked; need to add to filter list
                    const newItem: FilterListItem = {
                        section: section,
                        value: value,
                    };

                    newFilterList.push(newItem);
                } else {
                    // Remove from the filter list
                    newFilterList.splice(filterListIndex, 1);
                }

                setFilterList(newFilterList);
            }}
        />
    );
}

/**
 * A pop-up window containing a list of filter-able items in the form of checkboxes.
 */
export function FilterModal({
    showFilters,
    setShowFilters,
    filterList,
    setFilterList,
}: {
    showFilters: boolean;
    setShowFilters: Function;
    filterList: FilterListItem[];
    setFilterList: Function;
}) {
    return (
        <>
            <Modal
                show={showFilters}
                onHide={() => {
                    setShowFilters(false);
                }}
                dialogClassName="filter-modal"
            >
                <Modal.Header>
                    <Modal.Title>Filter Applicants</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="filter-form">
                        {Object.keys(filterMap).map((section) => {
                            return (
                                <Form.Group className="mb-3" key={section}>
                                    <Form.Label className="filter-section-title">
                                        {section}
                                    </Form.Label>
                                    {filterMap[section]["values"].map(
                                        (item: FilterMapItemValue) => {
                                            return (
                                                <FilterCheckbox
                                                    key={item["label"]}
                                                    value={item["value"]}
                                                    label={item["label"]}
                                                    section={section}
                                                    filterList={filterList}
                                                    setFilterList={
                                                        setFilterList
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </Form.Group>
                            );
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShowFilters(false)}
                        variant="light"
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

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
            filteredList = filterMap[key]["filterFunc"](
                filteredList,
                filterBuckets[key],
                position
            );
        } else {
            // Call the section's filter function
            filteredList = filterMap[key]["filterFunc"](
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

    return (
        applicantSummaries.filter(
            (applicantSummary) =>
                !excludeValues.includes(
                    applicantSummary?.application?.program || ""
                )
        ) || []
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

    return (
        applicantSummaries.filter(
            (applicantSummary) =>
                !excludeValues.includes(
                    applicantSummary?.application?.department || ""
                )
        ) || []
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

    return (
        applicantSummaries
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
            .filter((applicantSummary) => applicantSummary !== null) || []
    );
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

    return (
        applicantSummaries
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
            .filter((applicantSummary) => applicantSummary !== null) || []
    );
}
