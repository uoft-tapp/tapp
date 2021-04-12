import { Assignment } from "../api/defs/types";
import { ConfirmationDdahRowData } from "../views/admin/ddahs/manipulate-ddah-confirmation";

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
