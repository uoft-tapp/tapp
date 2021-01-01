import React from "react";
import type { HeaderGroup } from "react-table";
import {
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import { strip } from "../../libs/utils";
import { Badge } from "react-bootstrap";

export function SortableHeader<T extends object>({
    column,
}: {
    column: HeaderGroup<T>;
}) {
    let sortIcon = null;
    if (column.isSorted) {
        if (column.isSortedDesc) {
            sortIcon = (
                <div className="column-sort-icon">
                    <FaSortAlphaUp className="ml-2 text-secondary" />
                </div>
            );
        } else {
            sortIcon = (
                <div className="column-sort-icon">
                    <FaSortAlphaDown className="ml-2 text-secondary" />
                </div>
            );
        }
    }
    return (
        <div
            className="th"
            {...column.getHeaderProps(column.getSortByToggleProps())}
        >
            <div className="table-header">{column.render("Header")}</div>
            {sortIcon}
            <div
                {...column.getResizerProps()}
                className={`resizer ${column.isResizing ? "isResizing" : ""}`}
            />
        </div>
    );
}

export function FilterBar({
    onChange,
    count = null,
}: {
    onChange?: Function;
    count?: number | null;
}) {
    // `filterStrings` is the list of strings that we are filtering by. We
    // filter for rows that contain every string.
    const [filterStrings, setFilterStrings] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (typeof onChange === "function") {
            onChange(filterStrings.map((s) => strip(s.toLowerCase())));
        }
    }, [filterStrings, onChange]);

    const displayFilterStrings = filterStrings.filter((s) => strip(s));
    const normalizedFilterStrings = filterStrings.map((s) =>
        strip(s.toLowerCase())
    );

    /**
     * Insert a blank string to the front of the filterString list
     * if the first string is indeed unique compared to the others.
     */
    function saveFirstFilterString() {
        const firstString = strip((filterStrings[0] || "").toLowerCase());
        if (firstString === "") {
            return;
        }
        // If the string is not in the list of current strings,
        // insert a blank before it.
        if (!normalizedFilterStrings.slice(1).some((s) => s === firstString)) {
            // We are "pushing" a new filter string on the list. Make sure to strip
            // away any whitespace it may have.
            setFilterStrings(["", ...filterStrings.map((s) => strip(s))]);
        } else {
            // If the string is already on the list, we "blank"
            // it out.
            setFilterStrings(["", ...filterStrings.slice(1)]);
        }
    }

    function removeFilterString(filterString: string) {
        // The first string in the list is the one in the search box.
        // We don't actually want to delete that string. Instead we want to make it an
        // empty string so that the search box doesn't suddenly become filled
        // with the previous search string.
        if (filterString === filterStrings[0]) {
            setFilterStrings(["", ...filterStrings.slice(1)]);
            return;
        }
        const updatedFilterStrings = filterStrings.filter(
            (oldString) => oldString !== filterString
        );
        setFilterStrings(updatedFilterStrings);
    }

    return (
        <div className="filterable-table-filter">
            <FaSearch className="mr-3" />
            <input
                type="text"
                placeholder="Filter by..."
                onChange={(e) => {
                    setFilterStrings([
                        e.target.value,
                        ...filterStrings.slice(1),
                    ]);
                }}
                value={filterStrings[0] || ""}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        saveFirstFilterString();
                    }
                }}
            />
            {displayFilterStrings.length > 0 && (
                <span className="filter-table-filtering-by">Filtering by:</span>
            )}
            {displayFilterStrings.map((filterString, i) => (
                <Badge
                    className="filter-chip"
                    pill
                    variant="light"
                    key={`${filterString}-${i}`}
                >
                    {filterString}
                    <FaTimes
                        className="filter-chip-icon"
                        title="Remove filter"
                        onClick={() => removeFilterString(filterString)}
                    />
                </Badge>
            ))}
            {count != null && <div className="filter-item-count">{count}</div>}
        </div>
    );
}
