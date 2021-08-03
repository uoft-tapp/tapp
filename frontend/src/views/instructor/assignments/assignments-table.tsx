import React, { useMemo } from "react";
import { StatusCell } from "../../admin/offertable";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { formatDate } from "../../../libs/utils";
import { assignmentsSelector } from "../../../api/actions";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Assignment } from "../../../api/defs/types";

export function InstructorAssignmentsTable() {
    const activePosition = useSelector(activePositionSelector);
    const allAssignments = useSelector(assignmentsSelector);
    const positions = useMemo(
        () =>
            allAssignments.filter(
                (assignment) => assignment.position.id === activePosition?.id
            ),
        [activePosition, allAssignments]
    );

    if (!activePosition) {
        return <h4>No position currently selected</h4>;
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
            data={positions}
        />
    );
}
