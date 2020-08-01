import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { applicantsSelector, upsertApplicant } from "../../api/actions";
import { EditableField } from "../../components/edit-field-widgets";
import { Applicant } from "../../api/defs/types";
import { ApplicantsList } from "../../components/applicants";

/**
 * A cell that renders editable applicant information
 *
 * @param {*} props
 * @returns
 */
function EditableCell(props: {
    column: any;
    original: Applicant;
    upsertApplicant: Function;
    field: string;
    value: string;
}): React.ReactElement {
    const title = `Edit ${"" + props.column.Header}`;
    const { upsertApplicant, field } = props;

    async function onChange(newVal: string | number | null) {
        const applicantId = props.original.id;
        return await upsertApplicant({ id: applicantId, [field]: newVal });
    }
    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
            editable={true}
        >
            {props.value}
        </EditableField>
    );
}

export function ConnectedApplicantsList(props: object) {
    const { ...rest } = props;
    const applicants = useSelector(applicantsSelector) as Applicant[];
    const dispatch = useDispatch();

    function _upsertApplicant(applicant: Partial<Applicant>) {
        return dispatch(upsertApplicant(applicant));
    }

    // Bind an `ApplicantCell` to a particular field
    function generateCell(field: string) {
        return (props: any) => (
            <EditableCell
                field={field}
                upsertApplicant={_upsertApplicant}
                {...props}
            />
        );
    }

    const columns = [
        {
            Header: "Last Name",
            accessor: "last_name",
            Cell: generateCell("last_name"),
        },
        {
            Header: "First Name",
            accessor: "first_name",
            Cell: generateCell("first_name"),
        },
        {
            Header: "Email",
            accessor: "email",
            Cell: generateCell("email"),
        },
        {
            Header: "UTORid",
            accessor: "utorid",
            Cell: generateCell("utorid"),
        },
        {
            Header: "Student Number",
            accessor: "student_number",
            Cell: generateCell("student_number"),
        },
        {
            Header: "Phone",
            accessor: "phone",
            Cell: generateCell("phone"),
        },
    ];

    return (
        <ApplicantsList applicants={applicants} columns={columns} {...rest} />
    );
}
