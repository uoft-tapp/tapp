import React from "react";
import { connect } from "react-redux";
import {
    assignmentsSelector,
    upsertApplicant,
    upsertAssignment,
} from "../../api/actions";
import { OfferTable } from "../../components/offer-table";
import { EditableField } from "../../components/edit-field-widgets";
import { offerTableSelector, setSelectedRows } from "./actions";
import { Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { formatDownloadUrl, capitalize } from "../../libs/utils";

/**
 * A cell that renders editable applicant information
 *
 * @param {*} props
 * @returns
 */
function ApplicantCell(props) {
    const title = `Edit ${props.column.Header}`;
    const { upsertApplicant, field } = props;
    function onChange(newVal) {
        const applicantId = props.original.applicant.id;
        upsertApplicant({ id: applicantId, [field]: newVal });
    }
    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
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
function StatusCell({ original }) {
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
function AssignmentCell(props) {
    const title = `Edit ${props.column.Header}`;
    const { upsertAssignment, field } = props;
    const active_offer_status = props.original.active_offer_status;
    function onChange(newVal) {
        const applicationId = props.original.id;
        upsertAssignment({ id: applicationId, [field]: newVal });
    }
    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
            editable={
                !active_offer_status ||
                ["provisional", "withdrawn"].includes(active_offer_status)
            }
        >
            {props.value}
        </EditableField>
    );
}

function EditableOfferTable(props) {
    const { upsertApplicant, upsertAssignment, ...rest } = props;

    // Bind an `ApplicantCell` to a particular field
    function generateApplicantCell(field) {
        return (props) => (
            <ApplicantCell
                field={field}
                upsertApplicant={upsertApplicant}
                {...props}
            />
        );
    }

    // Bind an `AssignmentCell` to a particular field
    function generateAssignmentCell(field) {
        return (props) => (
            <AssignmentCell
                field={field}
                upsertAssignment={upsertAssignment}
                {...props}
            />
        );
    }

    const columns = [
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
            accessor: (data) => capitalize(data.active_offer_status || ""),
            Cell: StatusCell,
        },
    ];

    return <OfferTable columns={columns} {...rest} />;
}

/**
 * OfferTable that has been connected to the redux store
 * for live updates and editability.
 */
export const ConnectedOfferTable = connect(
    (state) => ({
        data: assignmentsSelector(state).map((offer) => {
            const { active_offer_status, ...rest } = offer;
            return !active_offer_status
                ? { active_offer_status: "No Contract", ...rest }
                : offer;
        }),
        selected: offerTableSelector(state).selectedAssignmentIds,
    }),
    { upsertApplicant, upsertAssignment, setSelected: setSelectedRows }
)(EditableOfferTable);
