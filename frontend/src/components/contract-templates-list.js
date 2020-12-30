import React from "react";
import PropTypes from "prop-types";
import { docApiPropTypes } from "../api/defs/doc-generation";

import { AdvancedFilterTable } from "./advanced-filter-table";

const DEFAULT_COLUMNS = [
    { Header: "Template Name", accessor: "template_name" },
    {
        Header: "Template File",
        accessor: "template_file",
    },
];

/**
 * List the contract templates using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{contractTemplates: object[], columns: object[]}} props
 * @returns
 */
export function ContractTemplatesList(props) {
    const { contractTemplates, columns = DEFAULT_COLUMNS } = props;
    return (
        <AdvancedFilterTable
            data={contractTemplates}
            columns={columns}
            filterable={true}
        />
    );
}
ContractTemplatesList.propTypes = {
    contractTemplates: PropTypes.arrayOf(docApiPropTypes.contractTemplate)
        .isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};
