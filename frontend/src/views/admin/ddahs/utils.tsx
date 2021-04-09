import { generateHeaderCell } from "../../../components/table-utils";

export interface ConfirmationDdahRowData {
    id?: number;
    position_code: string;
    last_name: string;
    first_name: string;
    total_hours: number | null;
    status: string;
    issue: string;
}

export const ddahModalColumn = [
    {
        Header: generateHeaderCell("Position"),
        accessor: "position_code",
        width: 200,
    },
    {
        Header: generateHeaderCell("Last Name"),
        accessor: "last_name",
        maxWidth: 120,
    },
    {
        Header: generateHeaderCell("First Name"),
        accessor: "first_name",
        maxWidth: 120,
    },
    {
        Header: generateHeaderCell("Status"),
        accessor: "status",
        maxWidth: 100,
    },
    {
        Header: generateHeaderCell("Issues"),
        accessor: "issue",
        width: 250,
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

export function compareDDAH(
    d1: ConfirmationDdahRowData,
    d2: ConfirmationDdahRowData
) {
    return (
        compareString(d1.position_code, d2.position_code) ||
        compareString(d1.last_name, d2.last_name) ||
        compareString(d1.first_name, d2.first_name)
    );
}
