import React from "react";
import classNames from "classnames";
import {
    useTable,
    useSortBy,
    HeaderGroup,
    useGlobalFilter,
    useBlockLayout,
    useResizeColumns,
    useRowSelect,
} from "react-table";
import {
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import { strip } from "../libs/utils";
import { Badge } from "react-bootstrap";
import { shallowEqual } from "react-redux";
import { FixedSizeList } from "react-window";
import Scrollbars from "react-custom-scrollbars";
import AutoSizer from "react-virtualized-auto-sizer";

export const COLUMNS = [
    {
        Header: "Last Name",
        accessor: "last_name",
    },
    {
        Header: "First Name",
        accessor: "first_name",
    },
];

export const DATA = Array.from({ length: 10 }).map((r, i) => ({
    last_name: ("" + Math.random()).slice(0, 4),
    first_name: "" + Math.round(Math.random() * 10),
}));

const IndeterminateCheckbox = React.forwardRef(function IndeterminateCheckbox(
    { indeterminate, ...rest }: { indeterminate: boolean; [key: string]: any },
    ref?: any
) {
    React.useEffect(() => {
        if (ref && ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [ref, indeterminate]);

    return (
        <>
            <input type="checkbox" ref={ref ? ref : null} {...rest} />
        </>
    );
});

function SortableHeader<T extends object>({
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

function FilterBar({
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
                    // press enter to add the typed query to the filter list
                    // 13 == Enter
                    if (e.keyCode === 13) {
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

const EMPTY_OBJECT = {};

function idsToIndicesObject(
    ids: any[] | null | undefined,
    data: { id: any }[]
): { [key: string]: boolean } {
    if (!ids) {
        return EMPTY_OBJECT;
    }

    const ret: { [key: string]: boolean } = {};
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (ids.includes(item.id)) {
            ret[i] = true;
        }
    }
    return ret;
}

function generateSelectionHook(enabled: boolean) {
    if (!enabled) {
        return () => {};
    }
    // Code taken from useRowSelect example https://react-table.tanstack.com/docs/api/useRowSelect
    return (hooks: any) => {
        hooks.visibleColumns.push((columns: any[]) => [
            // Let's make a column for selection
            {
                id: "selection",
                // The header can use the table's getToggleAllRowsSelectedProps method
                // to render a checkbox
                Header: ({ getToggleAllRowsSelectedProps }: any) => (
                    <IndeterminateCheckbox
                        {...getToggleAllRowsSelectedProps()}
                    />
                ),
                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: ({ row }: any) =>
                    // We are only allowed to "check" rows that have a valid id (that is,
                    // a valid id from the actual data-structure. This is different from the
                    // internal react-table id).
                    row.original?.id != null ? (
                        <IndeterminateCheckbox
                            {...row.getToggleRowSelectedProps()}
                        />
                    ) : null,
                maxWidth: 45,
            },
            ...columns,
        ]);
    };
}

/**
 * A ReactTable that can be filtered and sorted. If a `setSelected`
 * function is passed in, checkboxes will be shown next to each row
 * with a non-null id and the user can select specific rows. If `filterable`
 * is true, a filter bar will appear.
 *
 * Note: `selected` is a list of ids (the `id` property on members of the `data` array).
 * Rows matching something in `selected` will be highlighted. This property can be used
 * without passing the `setSelected` function.
 *
 * @export
 * @param {({
 *     columns: any[];
 *     data: any[];
 *     filterable?: boolean | null;
 *     selected?: any[];
 *     setSelected?: Function;
 * })} {
 *     columns,
 *     data,
 *     filterable = null,
 *     selected,
 *     setSelected,
 * }
 * @returns
 */
export function AdvancedFilterTable({
    columns,
    data,
    filterable = null,
    selected,
    setSelected,
}: {
    columns: any[];
    data: any[];
    filterable?: boolean | null;
    selected?: any[];
    setSelected?: Function;
}) {
    // `filterString` contains a list of strings. We will show the rows that contain _all_
    // strings from the list.
    const [filterStrings, setFilterStrings] = React.useState<string[]>([]);
    const filterMethod = React.useCallback(
        function doFilter(rows: any[], columns: any[], filterName: string) {
            if (filterStrings.length === 0) {
                return rows;
            }
            // Return the rows where every filter string is included in some cell of that
            // row.
            return rows.filter((row) => {
                return filterStrings.every((str) =>
                    columns.some((colName) => {
                        const cellVal = row.values[colName];
                        return ("" + (cellVal || "")).toLowerCase().match(str);
                    })
                );
            });
        },
        [filterStrings]
    );

    const table = useTable(
        {
            columns,
            data,
            //initialState: { globalFilter: "" },
            filterTypes: { custom: filterMethod },
            globalFilter: "custom",
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            autoResetSelectedRows: false,
            initialState: {
                hiddenColumns: columns
                    .filter((col) => col.show === false)
                    .map((col) => col.id),
                selectedRowIds: idsToIndicesObject(selected, data),
            },
        },
        useBlockLayout,
        useResizeColumns,
        useGlobalFilter,
        useSortBy,
        useRowSelect,
        generateSelectionHook(!!setSelected)
    );

    const { selectedRowIds } = table.state;

    const scrollRef = React.useRef<FixedSizeList>(null);

    // If we do not set the `"custom"` filter method, it won't be called.
    React.useEffect(() => {
        table.setGlobalFilter("custom");
    }, [table, filterMethod]);

    function onFilterChange(newFilter: string[]) {
        if (!shallowEqual(newFilter, filterStrings)) {
            setFilterStrings(newFilter);
        }
    }

    React.useEffect(() => {
        if (typeof setSelected === "function") {
            let ret: number[] = [];
            for (const [index, isSelected] of Object.entries(selectedRowIds)) {
                if (!isSelected) {
                    continue;
                }
                const id = data[+index]?.id;
                if (!ret.includes(id)) {
                    ret.push(id);
                }
            }
            ret.sort();
            // An id is never null, however if there is a row in our table that lacks an id
            // a null value may end up in the list. (This is the id of the original data,
            // not the internal ReactTable id).
            ret = ret.filter((id) => id != null);
            if (!shallowEqual(ret, [...(selected || [])].sort())) {
                setSelected(ret);
            }
        }
    }, [selectedRowIds, selected, setSelected, data]);

    const renderRow = React.useCallback(
        ({ index, style }) => {
            const row = table.rows[index];
            table.prepareRow(row);
            return (
                <div
                    {...row.getRowProps({ style })}
                    className={classNames("tr", {
                        "table-primary":
                            row.isSelected && (row.original as any)?.id != null,
                    })}
                >
                    {row.cells.map((cell) => (
                        <div
                            {...cell.getCellProps()}
                            className={classNames(
                                "td",
                                (cell.column as any).className,
                                {
                                    "selection-checkbox":
                                        cell.column.id === "selection",
                                }
                            )}
                        >
                            {cell.render("Cell")}
                        </div>
                    ))}
                </div>
            );
        },
        [table]
    );

    const handleScroll = React.useCallback(
        ({ target }) => {
            const { scrollTop } = target;

            if (scrollRef.current) {
                scrollRef.current.scrollTo(scrollTop);
            }
        },
        [scrollRef]
    );

    return (
        <div className="filter-table-container">
            {filterable && (
                <FilterBar
                    onChange={onFilterChange}
                    count={table.rows.length}
                />
            )}
            <div
                {...table.getTableProps()}
                className="table table-bordered table-sm"
            >
                <div className="thead">
                    {table.headerGroups.map((headerGroup) => (
                        <div
                            {...headerGroup.getHeaderGroupProps()}
                            className="thr"
                        >
                            {headerGroup.headers.map((column, i) => (
                                <SortableHeader key={i} column={column} />
                            ))}
                        </div>
                    ))}
                </div>
                <div {...table.getTableBodyProps()} className="tbody">
                    <AutoSizer>
                        {({ width, height }) => {
                            // Don't let the table get too short no matter what
                            height = Math.max(height, 300);
                            return (
                                <Scrollbars
                                    style={{ width, height }}
                                    onScroll={handleScroll}
                                >
                                    <FixedSizeList
                                        height={height}
                                        itemCount={table.rows.length}
                                        itemSize={30}
                                        width={table.totalColumnsWidth}
                                        ref={scrollRef}
                                        style={{
                                            overflow: "visible",
                                        }}
                                    >
                                        {renderRow}
                                    </FixedSizeList>
                                </Scrollbars>
                            );
                        }}
                    </AutoSizer>
                </div>
            </div>
        </div>
    );
}
