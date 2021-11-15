import React from "react";
import classNames from "classnames";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    useBlockLayout,
    useResizeColumns,
} from "react-table";
import { shallowEqual } from "react-redux";
import { FixedSizeList } from "react-window";
import Scrollbars from "react-custom-scrollbars";
import AutoSizer from "react-virtualized-auto-sizer";
import { generateSelectionHook } from "./row-select";
import { FilterBar, SortableHeader } from "./row-filter";

import "./filter-table.css";

/**
 * A ReactTable that can be filtered and sorted. If a `setSelected`
 * function is passed in, checkboxes will be shown next to each row
 * with a non-null id and the user can select specific rows. If `filterable`
 * is true, a filter bar will appear.
 *
 * Note: `selected` is a list of ids (the `id` property on members of the `data` array).
 * Rows matching something in `selected` will be highlighted. This property can be used
 * without passing the `setSelected` function.
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
                        return (
                            ("" + (cellVal || "")).toLowerCase().indexOf(str) >=
                            0
                        );
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
    const { isHiddenRowsSelected } = table;
    const scrollRef = React.useRef<FixedSizeList>(null);
    const headerScrollRef = React.useRef<HTMLDivElement>(null);

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
            const { scrollTop, scrollLeft } = target;

            if (scrollRef.current) {
                scrollRef.current.scrollTo(scrollTop);
            }
            if (headerScrollRef.current) {
                headerScrollRef.current.scrollTo({ left: scrollLeft });
            }
        },
        [scrollRef, headerScrollRef]
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
                <div className="thead" ref={headerScrollRef}>
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
                <HiddenRowWarning visible={isHiddenRowsSelected} />
                <div {...table.getTableBodyProps()} className="tbody">
                    <AutoSizer>
                        {({ width, height }) => {
                            // Don't let the table get too short no matter what
                            //height = Math.max(height, 300);
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

function HiddenRowWarning({ visible }: { visible: boolean }) {
    if (!visible) {
        return null;
    }
    return (
        <div className="hidden-row-warning">
            There are rows selected that are not visible…
        </div>
    );
}
