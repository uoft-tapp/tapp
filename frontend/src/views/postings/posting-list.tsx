import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { postingsSelector, upsertPosting } from "../../api/actions";
import type { Posting } from "../../api/defs/types";
import type { EditableType } from "../../components/editable-cell";
import type { Cell, Column } from "react-table";
import { EditableCell } from "../../components/editable-cell";
import { AdvancedFilterTable } from "../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../components/table-utils";

export function ConnectedPostingsList({ editable = true }) {
    const postings: Posting[] = useSelector(postingsSelector);
    const dispatch = useDispatch();
    const _upsertPosting = (val: Partial<Posting>) =>
        dispatch(upsertPosting(val));

    function generateCell(field: keyof Posting, type: EditableType) {
        return (props: Cell<Posting>) => (
            <EditableCell
                field={field}
                upsert={_upsertPosting}
                type={type}
                editable={editable}
                {...props}
            />
        );
    }

    const DEFAULT_COLUMNS: Column<Posting>[] = [
        {
            Header: generateHeaderCell("Name"),
            accessor: "name",
            Cell: generateCell("name", "text"),
        },
        {
            Header: generateHeaderCell("Open Date"),
            accessor: "open_date",
            Cell: generateCell("open_date", "date"),
        },
        {
            Header: generateHeaderCell("Close Date"),
            accessor: "close_date",
            Cell: generateCell("close_date", "date"),
        },
        { Header: generateHeaderCell("Status"), accessor: "status" },
    ];

    return (
        <React.Fragment>
            <AdvancedFilterTable columns={DEFAULT_COLUMNS} data={postings} />
        </React.Fragment>
    );
}
