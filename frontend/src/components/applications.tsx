import React from "react";
import PropTypes from "prop-types";
import { AdvancedFilterTable } from "./filter-table/advanced-filter-table";
import { Application } from "../api/defs/types";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "applicant.last_name" },
    { Header: "First Name", accessor: "applicant.first_name" },
    { Header: "UTORid", accessor: "applicant.utorid" },
    { Header: "Student Number", accessor: "applicant.student_number" },
    { Header: "Email", accessor: "applicant.email" },
    { Header: "Phone", accessor: "applicant.phone" },
];

/**
 * List the applicants using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{applicants: object[], columns: object[]}} props
 * @returns
 */
export function ApplicationsList(props: {
    applicants: (Omit<Application, "id"> | Application)[];
    columns?: any[];
}) {
    const { applicants, columns = DEFAULT_COLUMNS } = props;
    return (
        <AdvancedFilterTable
            columns={columns}
            data={applicants}
            filterable={true}
        />
    );
}
ApplicationsList.propTypes = {
    applicants: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
