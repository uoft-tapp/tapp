import React from "react";

import { AdvancedFilterTable } from "./filter-table/advanced-filter-table";
import { ContractTemplate } from "../api/defs/types";

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
 */
export function ContractTemplatesList(props: {
    contractTemplates: ContractTemplate[];
    columns?: any[];
}) {
    const { contractTemplates, columns = DEFAULT_COLUMNS } = props;
    return (
        <AdvancedFilterTable
            data={contractTemplates}
            columns={columns}
            filterable={true}
        />
    );
}
