import React from "react";
import { useSelector } from "react-redux";
import {
    assignmentsSelector,
    upsertApplicant,
    upsertAssignment,
} from "../../../api/actions";
import { EditableField } from "../../../components/edit-field-widgets";
import { offerTableSelector, setSelectedRows } from "./actions";
import { Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { formatDownloadUrl, capitalize, formatDate } from "../../../libs/utils";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { CellProps } from "react-table";
import {
    Applicant,
    Assignment,
    PropsForElement,
} from "../../../api/defs/types";

/**
 * A cell that renders editable applicant information. This component is expected
 * to be passed an **Assignment**. It will read the applicant from the assignment.
 */
export function ApplicantCell(
    props: CellProps<Assignment> & {
        field: keyof Applicant;
        upsertApplicant: (applicant: Partial<Applicant>) => any;
        editable: boolean;
    }
) {
    const title = `Edit ${"" + props.column.Header}`;
    const { upsertApplicant, field, editable } = props;
    const applicant = props.row.original;
    async function onChange(newVal: Applicant[typeof field]) {
        const applicantId = applicant.applicant.id;
        return await upsertApplicant({ id: applicantId, [field]: newVal });
    }
    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
            editable={editable}
        >
            {props.value}
        </EditableField>
    );
}

/**
 * Cell to show the status of a contract and offer a download button if a contract has been created.
 * I.e., a
 *
 * @param {*} { original }
 * @returns
 */
export function StatusCell({ row }: CellProps<Assignment>) {
    const original = row.original;
    const formattedStatus = capitalize(original.active_offer_status || "");
    const activeOfferUrlToken = original.active_offer_url_token;

    let download = null;
    if (activeOfferUrlToken) {
        const url = `/public/contracts/${activeOfferUrlToken}.pdf`;
        download = (
            <Button
                href={formatDownloadUrl(url)}
                variant="light"
                size="sm"
                className="mr-2 py-0"
                title="Download offer PDF"
            >
                <FaSearch />
            </Button>
        );
    }

    return (
        <>
            {download}
            {formattedStatus}
        </>
    );
}

/**
 * A cell that renders editable assignment information
 *
 * @param {*} props
 * @returns
 */
export function AssignmentCell(
    props: CellProps<Assignment> & {
        field: keyof Assignment;
        upsertAssignment: (applicant: Partial<Assignment>) => any;
        editable: boolean;
    }
) {
    const title = `Edit ${"" + props.column.Header}`;
    const { upsertAssignment, field, editable = true } = props;
    const assignment = props.row.original;
    const active_offer_status = assignment.active_offer_status;
    async function onChange(newVal: Assignment[typeof field]) {
        const assignmentId = assignment.id;
        return await upsertAssignment({ id: assignmentId, [field]: newVal });
    }
    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
            editable={
                editable &&
                (!active_offer_status ||
                    ["provisional", "withdrawn", "No Contract"].includes(
                        active_offer_status
                    ))
            }
        >
            {props.value}
        </EditableField>
    );
}

export function ConnectedOfferTable({
    editable = true,
    ...rest
}: { editable?: boolean } & Partial<
    PropsForElement<typeof AdvancedFilterTable>
>) {
    const dispatch = useThunkDispatch();
    const setSelected = React.useCallback(
        (rows: number[]) => dispatch(setSelectedRows(rows)),
        [dispatch]
    );
    const selected = useSelector(offerTableSelector).selectedAssignmentIds;
    const assignments = useSelector(assignmentsSelector);
    const data = React.useMemo(
        () =>
            assignments.map((assignment) => {
                const { active_offer_status, ...rest } = assignment;
                return !active_offer_status
                    ? { active_offer_status: "No Contract", ...rest }
                    : assignment;
            }),
        [assignments]
    );

    // We want to minimize the re-render of the table. Since some bindings for columns
    // are generated on-the-fly, memoize the result so we don't trigger unneeded re-renders.
    const columns = React.useMemo(() => {
        // Bind an `ApplicantCell` to a particular field
        function generateApplicantCell(field: keyof Applicant) {
            return (props: CellProps<Assignment>) => (
                <ApplicantCell
                    field={field}
                    upsertApplicant={(applicant: Partial<Applicant>) =>
                        dispatch(upsertApplicant(applicant))
                    }
                    editable={editable}
                    {...props}
                />
            );
        }

        // Bind an `AssignmentCell` to a particular field
        function generateAssignmentCell(field: keyof Assignment) {
            return (props: CellProps<Assignment>) => (
                <AssignmentCell
                    field={field}
                    upsertAssignment={(assignment: Partial<Assignment>) =>
                        dispatch(upsertAssignment(assignment))
                    }
                    editable={editable}
                    {...props}
                />
            );
        }

        return [
            {
                Header: "Last Name",
                accessor: "applicant.last_name",
                Cell: generateApplicantCell("last_name"),
            },
            {
                Header: "First Name",
                accessor: "applicant.first_name",
                Cell: generateApplicantCell("first_name"),
            },
            {
                Header: "Email",
                accessor: "applicant.email",
                Cell: generateApplicantCell("email"),
            },
            {
                Header: "Position",
                accessor: "position.position_code",
            },
            {
                Header: "Hours",
                accessor: "hours",
                className: "number-cell",
                maxWidth: 70,
                Cell: generateAssignmentCell("hours"),
            },
            {
                Header: "Status",
                id: "status",
                // We want items with no active offer to appear at the end of the list
                // when sorted, so we set their accessor to null (the accessor is used by react table
                // when sorting items).
                accessor: (dat: typeof data[number]) =>
                    dat.active_offer_status === "No Contract"
                        ? null
                        : dat.active_offer_status,
                Cell: StatusCell,
            },
            {
                Header: "Date",
                accessor: "active_offer_recent_activity_date",
                Cell: ({ value }: CellProps<typeof data>) =>
                    value ? formatDate(value) : null,
                maxWidth: 120,
            },
            {
                Header: "Nag Count",
                accessor: "active_offer_nag_count",
                // If the nag-count is 0, we don't want to show it,
                // so we return null in that case, which displays nothing.
                Cell: ({ value }: CellProps<typeof data>) =>
                    value ? value : null,
                maxWidth: 30,
            },
        ];
    }, [dispatch, editable]);

    return (
        <AdvancedFilterTable
            filterable={true}
            columns={columns}
            data={data}
            selected={selected}
            setSelected={setSelected}
            {...rest}
        />
    );
}
