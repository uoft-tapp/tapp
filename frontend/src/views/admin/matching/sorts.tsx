import { Position } from "../../../api/defs/types";
import { ApplicantSummary } from "./types";
import {
    getApplicantMatchForPosition,
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "./utils";
import { sum } from "../../../api/mockAPI/utils";

const sortMap: Record<
    string,
    [(applicantSummaries: ApplicantSummary[], asc?: boolean) => void, boolean]
> = {
    nameAsc: [sortByLastName, true],
    nameDesc: [sortByLastName, false],
    programAsc: [sortByProgram, true],
    programDesc: [sortByProgram, false],
    deptAsc: [sortByDepartment, true],
    deptDesc: [sortByDepartment, false],
    gpaAsc: [sortByGpa, true],
    gpaDesc: [sortByGpa, false],
    yipAsc: [sortByYip, true],
    yipDesc: [sortByYip, false],
    taPrefAsc: [sortByApplicantPref, true],
    taPrefDesc: [sortByApplicantPref, false],
    instPrefAsc: [sortByInstuctorRating, true],
    instPrefDesc: [sortByInstuctorRating, false],
    totalHoursAssignedAsc: [sortByTotalHoursAssigned, true],
    totalHoursAssignedDesc: [sortByTotalHoursAssigned, false],
    totalHoursOwedAsc: [sortByTotalHoursOwed, true],
    totalHoursOwedDesc: [sortByTotalHoursOwed, false],
    remainingHoursOwedAsc: [sortByRemainingHoursOwed, true],
    remainingHoursOwedDesc: [sortByRemainingHoursOwed, false],
};

export const sortKeys = Object.keys(sortMap);
let currPosition: Position | null = null;

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
    for (const sortName of sortList.reverse()) {
        if (!Object.keys(sortMap).includes(sortName)) {
            return;
        }

        sortMap[sortName][0](applicantSummaries, sortMap[sortName][1]);
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
        return (a.guarantee?.totalHoursOwed || 0) < (b.guarantee?.totalHoursOwed || 0)
            ? flipIfDescending(-1, asc)
            : flipIfDescending(1, asc);
    });
}

function sortByRemainingHoursOwed(
    applicantSummaries: ApplicantSummary[],
    asc = true
) {
    console.log("sorted by remaining hours owed");
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
