import React from "react";
import PropTypes from "prop-types";

import { FilterableTable } from "./filterable-table";

const COLUMNS = [
    { Header: "Last Name", accessor: "applicant.last_name" },
    { Header: "First Name", accessor: "applicant.first_name" },
    { Header: "Email", accessor: "applicant.email", width: 250 },
    {
        Header: "Student Number",
        accessor: "applicant.student_number",
        width: 100,
    },
    {
        Header: "Position",
        accessor: "position.position_code",
        width: 130,
    },
    {
        Header: "Hours",
        accessor: "hours",
        width: 100,
    },
    {
        Header: "Contract",
        accessor: "position.contract_template.template_name",
        width: 100,
    },
    {
        Header: "First Time?",
        accessor: "applicant.first_time_ta",
        Cell: (props) => (
            <div style={{ backgroundColor: "red" }}>
                {("" + props.value).toUpperCase()}
            </div>
        ),
        width: 100,
    }, // boolean
    { Header: "Status", accessor: "status", width: 100 },
    { Header: "Nag Count", accessor: "nag_count", width: 100 },
];

/**
 * A filterable offer table. If `selected` and `setSelected` props are provided,
 * rows of this table can be selected.
 *
 * @param {*} props
 * @param {list} props.data - a list of assignments
 * @param {list} props.selected - a list of assignment `id`s that are selected
 * @param {func} props.setSelected - function that is called to set the selected ids
 * @returns
 */
function OfferTable(props) {
    const { data, selected, setSelected, columns = COLUMNS } = props;
    return (
        <FilterableTable
            data={data}
            selected={selected}
            setSelected={setSelected}
            columns={columns}
        />
    );
}
OfferTable.propTypes = {
    selected: PropTypes.array,
    setSelected: PropTypes.func,
    data: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            Header: PropTypes.string,
            accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        })
    ),
};

export { OfferTable };
