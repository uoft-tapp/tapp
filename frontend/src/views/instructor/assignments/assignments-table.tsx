import React, { useMemo } from "react";
import { StatusCell } from "../../admin/offertable";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { formatDate } from "../../../libs/utils";
import { assignmentsSelector } from "../../../api/actions";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Assignment } from "../../../api/defs/types";
import { ddahsSelector } from "../../../api/actions/ddahs";
import { Button } from "react-bootstrap";

interface RowData {
    id: number;
    applicant: {
        first_name: string | null;
        last_name: string | null;
        utorid: string;
        email: string | null;
    };
    ddah: {
        id?: number;
        assignment: {
            id: number;
        };
    } | null;
    hours: number;
    active_offer_status: string | null;
    active_offer_recent_activity_date: string | null;
}

export function InstructorAssignmentsTable({
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
    const activePosition = useSelector(activePositionSelector);
    const allAssignments = useSelector(assignmentsSelector);
    const allDDAHs = useSelector(ddahsSelector);
    const rowData: RowData[] = useMemo(() => {
        const currentAssignments = allAssignments.filter(
            (assignment) => assignment.position.id === activePosition?.id
        );

        const assignmentsWithDDAH = currentAssignments.map((assignment) => ({
            ...assignment,
            ddah:
                allDDAHs.find((ddah) => ddah.assignment.id === assignment.id) ||
                null,
        }));

        return assignmentsWithDDAH;
    }, [activePosition, allAssignments, allDDAHs]);

    if (!activePosition) {
        return <h4>No position currently selected</h4>;
    }

    function ViewOrCreateCell({
        row,
    }: {
        row: { original: RowData };
    }): JSX.Element | null {
        const original = row.original;
        if (original.ddah?.id != null) {
            const ddah_id = original.ddah.id;
            // We are a real DDAH, so we want to view
            return (
                <Button
                    variant="light"
                    size="sm"
                    title={`View or Edit DDAH for ${original.applicant.first_name} ${original.applicant.last_name}`}
                    className="py-0"
                    style={{ minWidth: "60px" }}
                    onClick={() => {
                        if (onView) {
                            onView(ddah_id);
                        }
                    }}
                >
                    View
                </Button>
            );
        }
        return (
            <Button
                variant="light"
                size="sm"
                title={`Create DDAH for ${original.applicant.first_name} ${original.applicant.last_name}`}
                className="py-0"
                onClick={() => {
                    if (onCreate) {
                        onCreate(original.id);
                    }
                }}
            >
                Create
            </Button>
        );
    }

    const columns = [
        {
            Header: "Last Name",
            accessor: "applicant.last_name",
        },
        {
            Header: "First Name",
            accessor: "applicant.first_name",
        },
        {
            Header: "UTORid",
            accessor: "applicant.utorid",
        },
        {
            Header: "Email",
            accessor: "applicant.email",
            Cell: ({
                value,
                row,
            }: {
                value: string;
                row: { original: Assignment };
            }) => {
                const assignment = row.original;
                const applicant = assignment.applicant;
                return (
                    <a
                        href={encodeURI(
                            `mailto:${applicant.first_name} ${applicant.last_name} <${value}>?subject=${activePosition.position_code}&body=Dear ${applicant.first_name} ${applicant.last_name},\n\n`
                        )}
                    >
                        {value}
                    </a>
                );
            },
        },
        {
            Header: "Hours",
            accessor: "hours",
            className: "number-cell",
            maxWidth: 70,
        },
        {
            Header: "Offer Status",
            id: "status",
            // We want items with no active offer to appear at the end of the list
            // when sorted, so we set their accessor to null (the accessor is used by react table
            // when sorting items).
            accessor: (data: any) =>
                data.active_offer_status === "No Contract"
                    ? null
                    : data.active_offer_status,
            Cell: StatusCell,
        },
        {
            Header: "DDAH",
            Cell: ViewOrCreateCell,
            id: "add_or_edit",
            maxWidth: 70,
            resizable: false,
            className: "details-col centered",
        },
        {
            Header: "Recent Activity",
            accessor: "active_offer_recent_activity_date",
            Cell: ({ value }: { value: string }) =>
                value ? formatDate(value) : null,
        },
    ];

    return (
        <AdvancedFilterTable
            filterable={true}
            columns={columns}
            data={rowData}
        />
    );
}
