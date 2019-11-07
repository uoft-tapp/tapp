import React from "react";
import { connect } from "react-redux";
import {
    assignmentsSelector,
    upsertApplicant,
    upsertAssignment
} from "../../api/actions";
import { OfferTable } from "../../components/offer-table";
import { EditableField } from "../../components/edit-field-widgets";
import { offerTableSelector, setSelectedRows } from "./actions";

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
 * A cell that renders editable assignment information
 *
 * @param {*} props
 * @returns
 */
function AssignmentCell(props) {
    const title = `Edit ${props.column.Header}`;
    const { upsertAssignment, field } = props;
    function onChange(newVal) {
        const applicationId = props.original.id;
        upsertAssignment({ id: applicationId, [field]: newVal });
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

function EditableOfferTable(props) {
    const { upsertApplicant, upsertAssignment, ...rest } = props;

    // Bind an `ApplicantCell` to a particular field
    function generateApplicantCell(field) {
        return props => (
            <ApplicantCell
                field={field}
                upsertApplicant={upsertApplicant}
                {...props}
            />
        );
    }

    // Bind an `AssignmentCell` to a particular field
    function generateAssignmentCell(field) {
        return props => (
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
            Cell: generateApplicantCell("last_name")
        },
        {
            Header: "First Name",
            accessor: "applicant.first_name",
            Cell: generateApplicantCell("first_name")
        },
        {
            Header: "Email",
            accessor: "applicant.email",
            Cell: generateApplicantCell("email")
        },
        {
            Header: "Position",
            accessor: "position.position_code",
        },
        {
            Header: "Hours",
            accessor: "hours",
            Cell: generateAssignmentCell("hours")
        }
    ];

    return <OfferTable columns={columns} {...rest} />;
}

/**
 * OfferTable that has been connected to the redux store
 * for live updates and editability.
 */
export const ConnectedOfferTable = connect(
    state => ({
        data: assignmentsSelector(state),
        selected: offerTableSelector(state).selectedAssignmentIds
    }),
    { upsertApplicant, upsertAssignment, setSelected: setSelectedRows }
)(EditableOfferTable);
