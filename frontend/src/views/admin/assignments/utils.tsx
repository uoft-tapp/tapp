import { Assignment } from "../../../api/defs/types";

export const assignmentModalColumn = [
    {
        Header: "Last Name",
        accessor: "applicant.last_name",
        maxWidth: 120,
    },
    {
        Header: "First Name",
        accessor: "applicant.first_name",
        maxWidth: 120,
    },
    {
        Header: "Position",
        accessor: "position.position_code",
        width: 200,
    },
    {
        Header: "Hours",
        accessor: "hours",
        className: "number-cell",
        maxWidth: 70,
    },
    {
        Header: "Status",
        maxWidth: 100,
        id: "status",
        // We want items with no active offer to appear at the end of the list
        // when sorted, so we set their accessor to null (the accessor is used by react table
        // when sorting items).
        accessor: (data: { active_offer_status: string }) =>
            data.active_offer_status === "No Contract"
                ? null
                : data.active_offer_status,
    },
];

function compareString(str1: string, str2: string) {
    if (str1 > str2) {
        return 1;
    } else if (str1 < str2) {
        return -1;
    }
    return 0;
}

export function compareAssignment(a1: Assignment, a2: Assignment) {
    return (
        compareString(a1.position.position_code, a2.position.position_code) ||
        compareString(
            a1.applicant.last_name || "",
            a2.applicant.last_name || ""
        ) ||
        compareString(a1.applicant.first_name, a2.applicant.first_name)
    );
}
