import React from "react";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { assignmentsSelector } from "../../../api/actions";
import { ddahsSelector } from "../../../api/actions/ddahs";
import { Ddah } from "../../../api/defs/types";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { getReadableAssignmentStatus } from "../../../libs/utils";

export interface RowData {
    id?: number;
    last_name: string;
    first_name: string;
    email: string | null;
    utorid: string | null;
    hours: number | null;
    status: string | null;
    ddah: Ddah | null;
}

/**
 * Table that displays TA information for TAs associated with a single position.
 *
 * @export
 * @param {{
 *     position_id: number;
 * }} {
 *     position_id,
 * }
 * @returns
 */
export function ConnectedTAsTable({
    position_id,
    onViewDDAH,
    onCreateDDAH,
}: {
    position_id: number;
    onViewDDAH?: (ddah: Ddah | null) => any;
    onCreateDDAH?: (assignment_id: number) => any;
}) {
    const allAssignments = useSelector(assignmentsSelector);
    const allDdahs = useSelector(ddahsSelector);
    let ddahs = allDdahs.filter(
        (ddah) => ddah.assignment.position.id === position_id
    );
    const assignments = allAssignments.filter(
        (assignment) => assignment.position.id === position_id
    );

    // The omni-search doesn't work on nested properties, so we need to flatten
    // the data we display before sending it to the table.
    const data = assignments.map((assignment) => {
        const ddah =
            ddahs.find((ddah) => ddah.assignment.id === assignment.id) || null;
        return {
            id: assignment.id,
            last_name: assignment.applicant.last_name,
            first_name: assignment.applicant.first_name,
            email: assignment.applicant.email,
            utorid: assignment.applicant.utorid,
            hours: ddah?.total_hours,
            status: assignment.active_offer_status,
            readable_status: getReadableAssignmentStatus(assignment),
            ddah: ddah,
        } as RowData;
    });

    function ViewOrCreateDDAHCell({
        row,
    }: {
        row: { original: RowData };
    }): JSX.Element | null {
        const original = row.original;
        if (original.ddah != null) {
            const ddah = original.ddah;
            // We are a real DDAH, so we want to view
            return (
                <Button
                    variant="light"
                    size="sm"
                    title={`View or Edit DDAH for ${original.first_name} ${original.last_name}`}
                    className="py-0"
                    onClick={() => {
                        if (onViewDDAH) {
                            onViewDDAH(ddah);
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
                title={`Create DDAH for ${original.first_name} ${original.last_name}`}
                className="py-0"
                onClick={() => {
                    if (onCreateDDAH) {
                        onCreateDDAH(original.id || -1);
                    }
                }}
            >
                Create
            </Button>
        );
    }

    const columns = [
        { Header: generateHeaderCell("Last Name"), accessor: "last_name" },
        { Header: generateHeaderCell("First Name"), accessor: "first_name" },
        { Header: generateHeaderCell("Email"), accessor: "email" },
        { Header: generateHeaderCell("UTORid"), accessor: "utorid" },
        {
            Header: generateHeaderCell("DDAH Hours"),
            accessor: "hours",
            maxWidth: 120,
            style: { textAlign: "right" },
        },
        {
            Header: generateHeaderCell("Status"),
            accessor: "readable_status",
        },
        {
            Header: generateHeaderCell("DDAH"),
            Cell: ViewOrCreateDDAHCell,
            id: "add_or_edit",
            resizable: false,
            className: "details-col",
        },
    ];

    return (
        <AdvancedFilterTable columns={columns} data={data} filterable={true} />
    );
}
