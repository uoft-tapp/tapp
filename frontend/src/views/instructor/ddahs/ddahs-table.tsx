import React from "react";
import { Button } from "react-bootstrap";
import {
    FaCheck,
    FaPaperPlane,
    FaPlus,
    FaRegCalendar,
    FaSearch,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { assignmentsSelector } from "../../../api/actions";
import { ddahsSelector } from "../../../api/actions/ddahs";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { ddahIssues, getReadableStatus } from "../../../libs/ddah-utils";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { formatDate } from "../../../libs/utils";
import { setDdahForEmailIds } from "../store/actions";

export interface RowData {
    id?: number;
    position_code: string;
    assignment_id: number;
    last_name: string;
    first_name: string;
    total_hours: number | null;
    status: string | null;
    emailed_date: string | null;
    issues: string | null;
    issue_code: "hours_mismatch" | "missing" | null;
}

/**
 * Cell for rendering the issues of a DDAH
 *
 * @param {{ original: RowData }} { original }
 * @returns {React.ReactNode}
 */
export function IssuesCell({
    row,
}: {
    row: { original: RowData };
}): JSX.Element | null {
    const original = row.original;
    switch (original.issue_code) {
        case "hours_mismatch":
            return <div className="hours-mismatch-ddah">{original.issues}</div>;
        case "missing":
            return <div className="missing-ddah">{original.issues}</div>;
        default:
            return null;
    }
}

/**
 * Table that displays DDAH information for DDAHs associated with a single assignment.
 *
 * @export
 * @param {{
 *     assignment_id: number;
 * }} {
 *     assignment_id,
 * }
 * @returns
 */
export function ConnectedDdahsTable({
    position_id,
    onView,
    onCreate,
    onEmail,
}: {
    position_id: number;
    onView?: (ddah_id: number) => any;
    onCreate?: (assignment_id: number) => any;
    onEmail?: () => any;
}) {
    const allAssignments = useSelector(assignmentsSelector);
    const allDdahs = useSelector(ddahsSelector);
    let ddahs = allDdahs.filter(
        (ddah) => ddah.assignment.position.id === position_id
    );
    const assignments = allAssignments.filter(
        (assignment) => assignment.position.id === position_id
    );
    const dispatch = useThunkDispatch();

    // The omni-search doesn't work on nested properties, so we need to flatten
    // the data we display before sending it to the table.
    const data = ddahs.map(
        (ddah) =>
            ({
                id: ddah.id,
                assignment_id: ddah.assignment.id,
                position_code: ddah.assignment.position.position_code,
                last_name: ddah.assignment.applicant.last_name,
                first_name: ddah.assignment.applicant.first_name,
                total_hours: ddah.total_hours,
                status: ddah.status || "unsent",
                emailed_date: formatDate(ddah.emailed_date || ""),
                approved: ddah.approved_date ? "Approved" : "",
                readable_status: getReadableStatus(ddah),
                issues: ddahIssues(ddah),
                issue_code: ddahIssues(ddah) ? "hours_mismatch" : null,
            } as RowData)
    );

    function ViewOrCreateCell({
        row,
    }: {
        row: { original: RowData };
    }): JSX.Element | null {
        const original = row.original;
        if (original.id != null) {
            const ddah_id = original.id;
            // We are a real DDAH, so we want to view
            return (
                <Button
                    variant="light"
                    size="sm"
                    title={`View or Edit DDAH for ${original.first_name} ${original.last_name}`}
                    className="py-0"
                    onClick={() => {
                        if (onView) {
                            onView(ddah_id);
                        }
                    }}
                >
                    <FaSearch />
                </Button>
            );
        }
        return (
            <Button
                variant="light"
                size="sm"
                title={`Create DDAH for ${original.first_name} ${original.last_name}`}
                className="py-0"
                onClick={() => {
                    if (onCreate) {
                        onCreate(original.assignment_id);
                    }
                }}
            >
                <FaPlus />
            </Button>
        );
    }

    // We want to also list all assignments for which there isn't a DDAH.
    // We start by hashing all the existing DDAHs
    const ddahAssignmentIdsHash = {} as { [key: string]: true };
    for (const ddah of ddahs) {
        ddahAssignmentIdsHash[ddah.assignment.id] = true;
    }
    for (const assignment of assignments) {
        if (ddahAssignmentIdsHash[assignment.id]) {
            // We have an associated DDAH
            continue;
        }
        data.push({
            position_code: assignment.position.position_code,
            assignment_id: assignment.id,
            last_name: assignment.applicant.last_name || "",
            first_name: assignment.applicant.first_name,
            total_hours: null,
            status: null,
            emailed_date: null,
            issues: "Missing DDAH",
            issue_code: "missing",
        });
    }

    // Sort the table by position_code by default
    data.sort((a, b) => {
        if (a.position_code > b.position_code) {
            return 1;
        } else if (a.position_code < b.position_code) {
            return -1;
        }
        if (a.last_name > b.last_name) {
            return 1;
        } else if (a.last_name < b.last_name) {
            return -1;
        }
        return 0;
    });

    const columns = [
        {
            Header: (
                <div title="View or edit a DDAH">
                    <FaRegCalendar />
                </div>
            ),
            Cell: ViewOrCreateCell,
            id: "add_or_edit",
            maxWidth: 40,
            resizable: false,
            className: "details-col centered",
        },
        { Header: generateHeaderCell("Last Name"), accessor: "last_name" },
        { Header: generateHeaderCell("First Name"), accessor: "first_name" },
        {
            Header: generateHeaderCell("DDAH Hours"),
            accessor: "total_hours",
            maxWidth: 120,
            style: { textAlign: "right" },
        },
        {
            Header: generateHeaderCell("Status"),
            accessor: "status",
        },
        {
            Header: generateHeaderCell("Emailed"),
            accessor: "emailed_date",
            Cell: ({
                value,
                row,
            }: {
                value: string;
                row: { original: RowData };
            }) => {
                const data = row.original;
                if (!data.id) {
                    // In this case, the row doesn't correspond to an existing DDAH
                    return null;
                }
                return (
                    <React.Fragment>
                        {value}
                        <Button
                            variant="light"
                            size="sm"
                            className="py-0 mx-1 float-right"
                            title="Email DDAH"
                            onClick={() => {
                                if (!data.id || !onEmail) {
                                    return;
                                }
                                dispatch(setDdahForEmailIds([data.id]));
                                onEmail();
                            }}
                        >
                            <FaPaperPlane />
                        </Button>
                    </React.Fragment>
                );
            },
        },
        {
            Header: generateHeaderCell("Approved"),
            accessor: "approved",
            Cell: ({ value }: any) =>
                value ? (
                    <div className="accepted-ddah">
                        <FaCheck />
                    </div>
                ) : null,
        },
        {
            Header: generateHeaderCell("Issues"),
            accessor: "issues",
            Cell: IssuesCell,
        },
    ];

    return (
        <AdvancedFilterTable columns={columns} data={data} filterable={true} />
    );
}
