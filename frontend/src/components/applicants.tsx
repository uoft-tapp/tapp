import React from "react";
import ReactTable from "react-table";
import { createDiffColumnsFromColumns } from "./diff-table";
import { Applicant, MinimalApplicant } from "../api/defs/types";
import { DiffSpec } from "../libs/diffUtils";
import { Form } from "react-bootstrap";
import { DialogRow } from "./forms/common-controls";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "last_name" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "UTORid", accessor: "utorid" },
    { Header: "Student Number", accessor: "student_number" },
    { Header: "Email", accessor: "email" },
    { Header: "Phone", accessor: "phone" },
];

/**
 * Display a DiffSpec array of positions and highlight the changes.
 *
 * @export
 * @param {*} { modifiedApplicants }
 * @returns
 */
export function ApplicantsDiffList({
    modifiedApplicants,
}: {
    modifiedApplicants: DiffSpec<MinimalApplicant, Applicant>[];
}) {
    return (
        <ApplicantsList
            applicants={modifiedApplicants as any[]}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

export function ApplicantsList(props: {
    applicants: (Omit<Applicant, "id"> | Applicant)[];
    columns?: any[];
}) {
    const { applicants, columns = DEFAULT_COLUMNS } = props;
    return (
        <ReactTable
            data={applicants}
            columns={columns}
            showPagination={false}
            minRows={1}
        />
    );
}

const DEFAULT_APPLICANT = {
    first_name: "",
    last_name: "",
    email: "",
    utorid: "",
    phone: "",
    student_number: "",
};

/**
 * Edit information about an instructor.
 *
 * @export
 * @param {{instructor: object, setInstructor: function}} props
 * @returns
 */
export function ApplicantEditor(props: {
    applicant: Partial<Applicant>;
    setApplicant: Function;
}) {
    const { applicant: applicantProps, setApplicant } = props;
    const applicant = { ...DEFAULT_APPLICANT, ...applicantProps };

    /**
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr: keyof Applicant) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = e.target.value || "";
            const newApplicant = { ...applicant, [attr]: newVal };
            setApplicant(newApplicant);
        };
    }

    /**
     * Create a bootstrap form component that updates the specified attr
     * of `position`
     *
     * @param {string} title - Label text of the form control
     * @param {string} attr - attribute of `position` to be updated when this form control changes
     * @returns {node}
     */
    function createFieldEditor(
        title: string,
        attr: keyof Applicant,
        type = "text"
    ) {
        return (
            <React.Fragment>
                <Form.Label>{title}</Form.Label>
                <Form.Control
                    type={type}
                    value={applicant[attr] || ""}
                    onChange={setAttrFactory(attr)}
                />
            </React.Fragment>
        );
    }

    return (
        <Form>
            <Form.Row>
                <DialogRow>
                    {createFieldEditor("First Name", "first_name")}
                    {createFieldEditor("Last Name", "last_name")}
                </DialogRow>
                <DialogRow>
                    {createFieldEditor("Email", "email")}
                    {createFieldEditor("UTORid", "utorid")}
                </DialogRow>
                <DialogRow>
                    {createFieldEditor("Student Number", "student_number")}
                    {createFieldEditor("Phone", "phone")}
                </DialogRow>
            </Form.Row>
        </Form>
    );
}
