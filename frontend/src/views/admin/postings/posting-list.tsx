import React from "react";
import { useSelector } from "react-redux";
import { postingsSelector, upsertPosting } from "../../../api/actions";
import type { Posting } from "../../../api/defs/types";
import type { EditableType } from "../../../components/editable-cell";
import type { Cell, Column } from "react-table";
import { EditableCell } from "../../../components/editable-cell";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

export function ConnectedPostingsList({ editable = true }) {
    const postings: Posting[] = useSelector(postingsSelector);
    const dispatch = useThunkDispatch();
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

    // props.original contains the row data for this particular session
    function CellDetailsButton({ row }: Cell<Posting>) {
        const posting = row?.original || {};
        return (
            <div className="details-button-container">
                <Link to={`/postings/${posting.id}/details`}>
                    <FaSearch
                        className="details-row-button"
                        title={`View details of ${posting.name}`}
                    />
                </Link>
            </div>
        );
    }
    const DEFAULT_COLUMNS: (Column<Posting> & {
        className?: string;
        resizable?: boolean;
    })[] = [
        {
            Header: generateHeaderCell("Details"),
            id: "details-col",
            className: "details-col",
            maxWidth: 32,
            resizable: false,
            Cell: CellDetailsButton,
        },
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
        {
            Header: generateHeaderCell("Availability"),
            accessor: "availability",
        },
    ];

    return (
        <React.Fragment>
            <AdvancedFilterTable columns={DEFAULT_COLUMNS} data={postings} />
        </React.Fragment>
    );
}
