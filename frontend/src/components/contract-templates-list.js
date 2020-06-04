import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";

const DEFAULT_COLUMNS = [
    { Header: "Template Name", accessor: "template_name" },
    { Header: "Template File", accessor: "template_file" },
];

/**
 * List the instructors using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{instructors: object[], columns: object[]}} props
 * @returns
 */
export function ContractTemplatesList(props) {
    const { contractTemplates, columns = DEFAULT_COLUMNS } = props;
    return (
        <React.Fragment>
            <h3>Contract Templates</h3>
            <ReactTable
                data={contractTemplates}
                columns={columns}
                showPagination={false}
                minRows={1}
            />
        </React.Fragment>
    );
}
ContractTemplatesList.propTypes = {
    contractTemplates: PropTypes.arrayOf(docApiPropTypes.contractTemplate)
        .isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
