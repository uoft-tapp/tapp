import { Position } from "../../../api/defs/types";
import { ApplicantSummary } from "./types";
import {
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "./utils";
import { sum } from "../../../api/mockAPI/utils";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import "./styles.css";

type sortMapItem = {
    function: Function;
    asc: boolean;
    name: string;
};

const sortMap: Record<string, sortMapItem> = {
    nameAsc: {
        function: sortByLastName,
        asc: true,
        name: "Name (ASC)",
    },
    nameDesc: {
        function: sortByLastName,
        asc: false,
        name: "Name (DESC)",
    },
    programAsc: {
        function: sortByProgram,
        asc: true,
        name: "Program (ASC)",
    },
    programDesc: {
        function: sortByProgram,
        asc: false,
        name: "Program (DESC)",
    },
    deptAsc: {
        function: sortByDepartment,
        asc: true,
        name: "Department (ASC)",
    },
    deptDesc: {
        function: sortByDepartment,
        asc: false,
        name: "Department (DESC)",
    },
    gpaAsc: {
        function: sortByGpa,
        asc: true,
        name: "GPA (ASC)",
    },
    gpaDesc: {
        function: sortByGpa,
        asc: false,
        name: "GPA (DESC)",
    },
    yipAsc: {
        function: sortByYip,
        asc: true,
        name: "Year in Progress (ASC)",
    },
    yipDesc: {
        function: sortByYip,
        asc: false,
        name: "Year in Progress (DESC)",
    },
    taPrefAsc: {
        function: sortByApplicantPref,
        asc: true,
        name: "TA Rating (ASC)",
    },
    taPrefDesc: {
        function: sortByApplicantPref,
        asc: false,
        name: "TA Rating (DESC)",
    },
    instPrefAsc: {
        function: sortByInstuctorRating,
        asc: true,
        name: "Instructor Rating (ASC)",
    },
    instPrefDesc: {
        function: sortByInstuctorRating,
        asc: false,
        name: "Instructor Rating (DESC)",
    },
    totalHoursAssignedAsc: {
        function: sortByTotalHoursAssigned,
        asc: true,
        name: "Total Hours Assigned (ASC)",
    },
    totalHoursAssignedDesc: {
        function: sortByTotalHoursAssigned,
        asc: false,
        name: "Total Hours Assigned (DESC)",
    },
    totalHoursOwedAsc: {
        function: sortByTotalHoursOwed,
        asc: true,
        name: "Total Hours Owed (ASC)",
    },
    totalHoursOwedDesc: {
        function: sortByTotalHoursOwed,
        asc: false,
        name: "Total Hours Owed (DESC)",
    },
    remainingHoursOwedAsc: {
        function: sortByRemainingHoursOwed,
        asc: true,
        name: "Remaining Hours Owed (ASC)",
    },
    remainingHoursOwedDesc: {
        function: sortByRemainingHoursOwed,
        asc: false,
        name: "Remaining Hours Owed (DESC)",
    },
};

let currPosition: Position | null = null;

export function SortDropdowns({
    sortList,
    setSortList,
}: {
    sortList: string[];
    setSortList: Function;
}) {
    return (
        <div className="sort-dropdown-container">
            {sortList.map((item, index) => {
                return (
                    <SortDropdownItem
                        key={index}
                        index={index}
                        selected={item}
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

function SortDropdownItem({
    index,
    selected,
    sortList,
    setSortList,
}: {
    index: number;
    selected: string | null;
    sortList: string[];
    setSortList: Function;
}) {
    return (
        <DropdownButton
            title={selected ? sortMap[selected]["name"] : "Sort by... "}
            size="sm"
            variant="light"
        >
            {/* Basically a "remove this sort" button at the top of the list */}
            {selected && (
                <Dropdown.Item
                    key="empty"
                    onSelect={() => {
                        let items = [...sortList];
                        items.splice(index, 1);
                        setSortList(items);
                    }}
                >
                    -
                </Dropdown.Item>
            )}

            {Object.keys(sortMap).map((item) => {
                return (
                    <Dropdown.Item
                        key={item}
                        onSelect={() => {
                            let items = [...sortList];
                            items[index] = item;
                            setSortList(items);
                        }}
                    >
                        {sortMap[item]["name"]}
                    </Dropdown.Item>
                );
            })}
        </DropdownButton>
    );
}

export function applySorts(
    applicantSummaries: ApplicantSummary[] | null,
    sortList: string[],
    position: Position | null
) {
    // Return early if any inputs aren't defined
    if (!position || !applicantSummaries || sortList.length === 0) {
        return;
    }

    currPosition = position;

    // Apply each sort in the opposite order they appear in sortList
    let reversedList = [...sortList].reverse();
    for (const sortName of reversedList) {
        if (sortName === "") {
            continue;
        }

        if (!Object.keys(sortMap).includes(sortName)) {
            return;
        }

        sortMap[sortName]["function"](
            applicantSummaries,
            sortMap[sortName]["asc"]
        );
    }
}

function flipIfDescending(val: number, asc: boolean) {
    return val * (asc ? 1 : -1);
}

function sortByLastName(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        return (
            a.applicant.last_name +
            ", " +
            a.applicant.first_name
        ).toLowerCase() <
            (
                b.applicant.last_name +
                ", " +
                b.applicant.first_name
            ).toLowerCase()
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

        return a.application.gpa > b.application.gpa
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByYip(applicantSummaries: ApplicantSummary[], asc = true) {
    applicantSummaries.sort((a, b) => {
        if (!a.application.yip) {
            return flipIfDescending(1, asc);
        }

        if (!b.application.yip) {
            return flipIfDescending(-1, asc);
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

        return aPref.preference_level < bPref.preference_level
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByInstuctorRating(
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

        return getApplicantTotalHoursAssigned(a) <
            getApplicantTotalHoursAssigned(b)
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByTotalHoursOwed(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    applicantSummaries.sort((a, b) => {
        return (a.guarantee?.totalHoursOwed || 0) <
            (b.guarantee?.totalHoursOwed || 0)
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

        return aHoursRemaining < bHoursRemaining
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}
