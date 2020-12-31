import React from "react";
import classNames from "classnames";
import {
    useTable,
    useSortBy,
    HeaderGroup,
    useGlobalFilter,
    useBlockLayout,
    useResizeColumns,
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

/**
 * Add or remove `elm` from `arr`. If `insert` is `true`,
 * the element is added. If `insert` is `false`, it is deleted.
 * *This function mutates the array*.
 *
 * @param {unknown[]} arr
 * @param {unknown} elm
 * @param {boolean} insert
 * @returns
 */
function insertOrDelete(arr: unknown[], elm: unknown, insert: boolean) {
    if (insert && !arr.includes(elm)) {
        arr.push(elm);
    }
    if (!insert && arr.includes(elm)) {
        arr.splice(arr.indexOf(elm), 1);
    }
    return arr;
}

/**
 * Compute, based on the visible and selected rows, whether the UI should
 * consider all the rows to be selected, or whether it should consider some
 * row to be selected. This is subtle because, for example, if no
 * rows are visible, we shouldn't consider "all rows selected".
 *
 * @param {any[]} selected
 * @param {any[]} visible
 * @returns {{
 *     isAllRowsSelected: boolean;
 *     isSomeRowsSelected: boolean;
 * }}
 */
function computeSelectionState(
    selected: any[],
    visible: any[]
): {
    isAllRowsSelected: boolean;
    isSomeRowsSelected: boolean;
} {
    return {
        isAllRowsSelected:
            visible.every((x) => selected.includes(x)) && visible.length > 0,
        isSomeRowsSelected: selected.length > 0,
    };
}

/**
 * Checkbox that can be checked or in an intermediate state.
 *
 * @param {{
 *     indeterminate: boolean;
 *     [key: string]: any;
 * }} {
 *     indeterminate,
 *     ...rest
 * }
 * @returns
 */
function IndeterminateCheckbox({
    indeterminate,
    ...rest
}: {
    indeterminate: boolean;
    [key: string]: any;
}) {
    return (
        <input
            type="checkbox"
            ref={(el) => el && (el.indeterminate = indeterminate)}
            {...rest}
        />
    );
}

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

/**
 * Generate a "hook" for ReactTable that adds a column of checkboxes to the table
 * where rows can be selected.
 *
 * @param {{
 *     enabled: boolean;
 *     selected?: number[];
 *     setSelected?: Function;
 * }} {
 *     enabled,
 *     selected,
 *     setSelected,
 * }
 * @returns
 */
function generateSelectionHook({
    enabled,
    selected,
    setSelected,
}: {
    enabled: boolean;
    selected?: number[];
    setSelected?: Function;
}) {
    if (!enabled) {
        return () => {};
    }
    const _selected = selected || [];
    // Code taken from useRowSelect example https://react-table.tanstack.com/docs/api/useRowSelect
    return (hooks: any) => {
        hooks.visibleColumns.push((columns: any[]) => [
            // Let's make a column for selection
            {
                id: "selection",
                // The header can use the table's getToggleAllRowsSelectedProps method
                // to render a checkbox
                Header: ({
                    isAllRowsSelected,
                    isSomeRowsSelected,
                    selected,
                    visible,
                }: any) => {
                    return (
                        <IndeterminateCheckbox
                            checked={isAllRowsSelected}
                            indeterminate={
                                isSomeRowsSelected &&
                                selected.length !== visible.length
                            }
                            onChange={() => {
                                if (!selected || !setSelected) {
                                    return;
                                }
                                if (isAllRowsSelected) {
                                    setSelected([]);
                                } else {
                                    setSelected(visible);
                                }
                            }}
                        />
                    );
                },
                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: ({ row, selected }: any) => {
                    // We are only allowed to "check" rows that have a valid id (that is,
                    // a valid id from the actual data-structure. This is different from the
                    // internal react-table id).
                    if (row.original?.id == null) {
                        return null;
                    }
                    const id = row.original.id as number;
                    return (
                        <IndeterminateCheckbox
                            indeterminate={false}
                            checked={selected?.includes(id)}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                if (selected && setSelected) {
                                    let newSelected = insertOrDelete(
                                        [...selected],
                                        id,
                                        e.target.checked
                                    );
                                    if (
                                        newSelected.length !== selected.length
                                    ) {
                                        setSelected(newSelected);
                                    }
                                }
                            }}
                        />
                    );
                },
                maxWidth: 45,
            },
            ...columns,
        ]);

        // Dynamically computed values are available on the `instance`
        // object, so we should append the selection-state information we need.
        hooks.useInstance.push((instance: any) => {
            const {
                rows,
            }: {
                rows: any[];
            } = instance;
            const selected = _selected;

            // Make sure each row is tagged with the `isSelected` attribute.
            const selectedSet = new Set(selected);
            for (const row of rows) {
                const id = row.original?.id;
                if (id != null) {
                    row.isSelected = selectedSet.has(id);
                }
            }

            const visible: number[] = React.useMemo(
                () =>
                    instance.sortedRows
                        .map((row: any) => row.original?.id)
                        .filter((x: any) => x != null),
                [instance.sortedRows]
            );

            const {
                isAllRowsSelected,
                isSomeRowsSelected,
            } = computeSelectionState(selected, visible);

            Object.assign(instance, {
                isAllRowsSelected,
                isSomeRowsSelected,
                selected,
                visible,
            });
        });
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
                        return ("" + (cellVal || "")).toLowerCase().indexOf(str) >= 0;
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
            filterTypes: { custom: filterMethod },
            globalFilter: "custom",
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            autoResetSelectedRows: false,
            initialState: {
                hiddenColumns: columns
                    .filter((col) => col.show === false)
                    .map((col) => col.id),
            },
        },
        useBlockLayout,
        useResizeColumns,
        useGlobalFilter,
        useSortBy,
        generateSelectionHook({ enabled: !!setSelected, selected, setSelected })
    );

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
