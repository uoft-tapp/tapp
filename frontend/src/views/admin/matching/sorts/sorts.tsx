import React from "react";

import { Position } from "../../../../api/defs/types";
import { ApplicantSummary } from "../types";
import {
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "../utils";
import { sum } from "../../../../libs/utils";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { GrFormClose } from "react-icons/gr";
import "../styles.css";

export type sortMapItem = {
    function: Function;
    asc: boolean;
    name: string;
};

export const defaultSortList = [
    {
        function: sortByDepartment,
        asc: true,
        name: "Department",
    },
    {
        function: sortByProgram,
        asc: false,
        name: "Program",
    },
    {
        function: sortByYip,
        asc: true,
        name: "Year in Progress",
    },
];

// A mapping of sort names to their sorting functions
const sortMap: Record<string, Function> = {
    Program: sortByProgram,
    Department: sortByDepartment,
    "Year in Progress": sortByYip,
    GPA: sortByGpa,
    "TA Preference": sortByApplicantPref,
    "Instructor Preference": sortByInstructorRating,
    "Total Hours Assigned": sortByTotalHoursAssigned,
    "Total Hours Owed": sortByTotalHoursOwed,
    "Remaining Hours Owed": sortByRemainingHoursOwed,
    "First Name": sortByFirstName,
    "Last Name": sortByLastName,
};

let currPosition: Position | null = null;

/**
 * A collection of dropdown lists (SortDropdownItem) for applying sorts.
 *
 * @returns
 */
export function SortDropdowns({
    sortList,
    setSortList,
}: {
    sortList: sortMapItem[];
    setSortList: Function;
}) {
    return (
        <div className="sort-dropdown-container">
            {sortList.map((item, index) => {
                return (
                    <SortDropdownItem
                        key={index}
                        index={index}
                        selected={item.name}
                        sortList={sortList}
                        setSortList={setSortList}
                    />
                );
            })}
            <SortDropdownItem
                key={sortList.length}
                index={sortList.length}
                selected={null}
                sortList={sortList}
                setSortList={setSortList}
            />
        </div>
    );
}

/**
 * A set of items including a dropdown list of sorting types,
 * a button for specifying whether the sort should be done in ascending/descending order,
 * and a button for removing the sort from the sorting list.
 *
 * @returns
 */
function SortDropdownItem({
    index,
    selected,
    sortList,
    setSortList,
}: {
    index: number;
    selected: string | null;
    sortList: sortMapItem[];
    setSortList: Function;
}) {
    let items: sortMapItem[];

    return (
        <>
            <DropdownButton
                title={selected ? selected : "Sort by... "}
                size="sm"
                variant="info"
                className="sort-dropdown"
            >
                {Object.keys(sortMap).map((item) => {
                    return (
                        <Dropdown.Item
                            key={item}
                            onSelect={() => {
                                items = [...sortList];
                                const newSortItem: sortMapItem = {
                                    function: sortMap[item],
                                    asc: true,
                                    name: item,
                                };

                                items[index] = newSortItem;
                                setSortList(items);
                            }}
                        >
                            {item}
                        </Dropdown.Item>
                    );
                })}
            </DropdownButton>
            {selected && (
                <div
                    className="sort-icon"
                    onClick={() => {
                        // Button for specifying ascending/descending order
                        items = [...sortList];
                        items[index] = {
                            ...items[index],
                            asc: !items[index]["asc"],
                        };
                        setSortList(items);
                    }}
                >
                    {" "}
                    {sortList[index]["asc"] ? (
                        <TiArrowSortedUp />
                    ) : (
                        <TiArrowSortedDown />
                    )}{" "}
                </div>
            )}
            {selected && (
                <div
                    className="sort-icon"
                    onClick={() => {
                        // Button for removing this sort
                        items = [...sortList];
                        items.splice(index, 1);
                        setSortList(items);
                    }}
                >
                    <GrFormClose />
                </div>
            )}
        </>
    );
}

/**
 * Applies a set of sorting functions outlined by "sortList" to a list of applicant summaries.
 *
 * @returns
 */
export function applySorts(
    applicantSummaries: ApplicantSummary[],
    sortList: sortMapItem[],
    position: Position | null
) {
    // Return early if any inputs aren't defined
    if (!position || applicantSummaries.length === 0 || sortList.length === 0) {
        return;
    }

    currPosition = position;

    // Apply each sort in the opposite order they appear in sortList
    let reversedList = [...sortList].reverse();
    for (const sortItem of reversedList) {
        sortItem["function"](applicantSummaries, sortItem["asc"]);
    }
}

// Wrapper function for handling ascending vs. descending sorts
function flipIfDescending(val: number, asc: boolean) {
    return val * (asc ? 1 : -1);
}

// Sorting functions -- all of these do in-place sorting
function sortByFirstName(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        return `${a.applicant.first_name}, ${a.applicant.last_name}`.toLowerCase() <
            `${b.applicant.first_name}, ${b.applicant.last_name}`.toLowerCase()
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByLastName(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        return `${a.applicant.last_name}, ${a.applicant.first_name}`.toLowerCase() <
            `${b.applicant.last_name}, ${b.applicant.first_name}`.toLowerCase()
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByProgram(applicantSummaries: ApplicantSummary[], asc = true) {
    const priority = ["U", "PD", "MScAC", "M", "P"];
    applicantSummaries.sort((a, b) => {
        // Empty entries are treated as lowest priority
        if (!a.application.program) {
            return flipIfDescending(1, asc);
        }

        if (!b.application.program) {
            return flipIfDescending(-1, asc);
        }

        // Then "other" responses
        if (priority.indexOf(a.application.program) === -1) {
            return flipIfDescending(1, asc);
        }

        if (priority.indexOf(b.application.program) === -1) {
            return flipIfDescending(-1, asc);
        }

        if (a.application.program === b.application.program) {
            return 0;
        }

        return priority.indexOf(a.application.program) <
            priority.indexOf(b.application.program)
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByGpa(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        if (!a.application.gpa) {
            return flipIfDescending(1, asc);
        }

        if (!b.application.gpa) {
            return flipIfDescending(-1, asc);
        }

        if (a.application.gpa === b.application.gpa) {
            return 0;
        }

        return a.application.gpa > b.application.gpa
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByYip(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        if (!a.application.yip) {
            return 1;
        }

        if (!b.application.yip) {
            return -1;
        }

        if (a.application.yip === b.application.yip) {
            return 0;
        }

        return a.application.yip < b.application.yip
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByDepartment(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        if (!a.application.department) {
            return flipIfDescending(1, asc);
        }

        if (!b.application.department) {
            return flipIfDescending(-1, asc);
        }

        return a.application.department < b.application.department
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByApplicantPref(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    applicantSummaries.sort((a, b) => {
        if (!currPosition) {
            return 0;
        }

        const aPref = getPositionPrefForPosition(a.application, currPosition);
        const bPref = getPositionPrefForPosition(b.application, currPosition);

        if (!aPref) {
            return flipIfDescending(-1, asc);
        }

        if (!bPref) {
            return flipIfDescending(1, asc);
        }

        if (aPref === bPref) {
            return 0;
        }

        return aPref.preference_level < bPref.preference_level
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByInstructorRating(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    applicantSummaries.sort((a, b) => {
        if (!currPosition) {
            return 0;
        }

        const aInstructorRatings =
            a.application.instructor_preferences
                .filter((pref) => pref.position.id === currPosition?.id)
                .map((rating) => {
                    return rating.preference_level;
                }) || [];

        const bInstructorRatings =
            b.application.instructor_preferences
                .filter((pref) => pref.position.id === currPosition?.id)
                .map((rating) => {
                    return rating.preference_level;
                }) || [];

        if (aInstructorRatings.length === 0) {
            return flipIfDescending(-1, asc);
        }

        if (bInstructorRatings.length === 0) {
            return flipIfDescending(1, asc);
        }

        const aAvgRating =
            sum(...aInstructorRatings) / aInstructorRatings.length;
        const bAvgRating =
            sum(...bInstructorRatings) / bInstructorRatings.length;

        if (aAvgRating === bAvgRating) {
            return 0;
        }

        return aAvgRating < bAvgRating
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByTotalHoursAssigned(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    applicantSummaries.sort((a, b) => {
        if (!a.matches) {
            return 1;
        }

        if (!b.matches) {
            return -1;
        }

        const aHours = getApplicantTotalHoursAssigned(a);
        const bHours = getApplicantTotalHoursAssigned(b);

        if (aHours === bHours) {
            return 0;
        }

        return aHours < bHours
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByTotalHoursOwed(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    applicantSummaries.sort((a, b) => {
        const aHours = a.guarantee?.totalHoursOwed || 0;
        const bHours = a.guarantee?.totalHoursOwed || 0;

        if (aHours === bHours) {
            return 0;
        }

        return aHours < bHours
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByRemainingHoursOwed(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    applicantSummaries.sort((a, b) => {
        if (!a.matches || !a.guarantee) {
            return 1;
        }

        if (!b.matches || !b.guarantee) {
            return -1;
        }

        let aHoursRemaining =
            (a.guarantee?.totalHoursOwed || 0) -
            (a.guarantee?.previousHoursFulfilled || 0) -
            getApplicantTotalHoursAssigned(a);

        let bHoursRemaining =
            (b.guarantee?.totalHoursOwed || 0) -
            (b.guarantee?.previousHoursFulfilled || 0) -
            getApplicantTotalHoursAssigned(b);

        if (aHoursRemaining === bHoursRemaining) {
            return 0;
        }

        return aHoursRemaining < bHoursRemaining
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}
