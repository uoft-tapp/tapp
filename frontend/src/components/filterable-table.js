import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";

import "react-table/react-table.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Badge } from "react-bootstrap";
import { strip, useDebounce } from "../libs/utils";

// React table is SLOW, so we memoize the component.
// We only re-render if the rows or columns have changed. We don't
// check all the props because there are several dynamically generated callbacks.
// However, the change in those callbacks should only matter if the contents of the rows
// has actually changed.
const SelectTable = React.memo(
// This HOC adds a checkbox to every row of a ReactTable
    selectTableHOC(ReactTable), (left, right) => {
    if (left === right) {
        return true;
    }
    // Non-object primitives can always be compared with === (except for NaN, which
    // we don't care about...)
    if (typeof left !== "object" || typeof right !== "object") {
        return false;
    }
    if (left == null || right == null) {
        return false;
    }

    return left.data === right.data && left.columns === right.columns;
});

const COLUMNS = [
    { Header: "Last Name", accessor: "last_name" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "Email", accessor: "applicant.email", width: 250 },
];
/**
 * Converts a row of the offer table into a string for omni-searching
 *
 * @param {*} row
 * @returns {string}
 */
function rowToStr(row) {
    // flatten to a string two levels deep
    return Object.values(row)
        .map((x) =>
            typeof x === "string" ? x : Object.values(x || {}).join(" ")
        )
        .join(" ")
        .toLowerCase();
}

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
function FilterableTable(props) {
    const { data, selected, setSelected, columns = COLUMNS } = props;
    // internally we use a more efficient datastructure than a list to keep track of `selected` things.
    const _selected = new Set(selected);
    const _setSelected = (_selected) => {
        // convert `_selected` back to a list before setting it.
        setSelected([..._selected]);
    };

    // `filterStrings` is the list of strings that we are filtering by. We
    // filter for rows that contain every string.
    const [filterStrings, setFilterStrings] = React.useState([]);
    const [lastSelected, setLastSelected] = React.useState(null);
    const [allSelected, setAllSelected] = React.useState(false);
    function isSelected(id) {
        return _selected.has(id);
    }

    const normalizedFilterStrings = filterStrings.map((s) =>
        strip(s.toLowerCase())
    );
    const filteredData = data.filter((row) =>
        normalizedFilterStrings.every((s) => rowToStr(row).match(s))
    );

    // React table can take a really long time to render. If the data is changing
    // rapidly, this can slow down the app. So, we debounce the data so it doesn't get
    // rendered too often.
    const displayData = useDebounce(filteredData, 500);

    // we need a reference to the internal table so that we can get the "visible data"
    // if it happens to be filtered or sorted
    let reactTableRef = React.useRef(null);

    /**
     * Gets the data that is actually displayed in the ReactTable. This is useful
     * for range selecting (shift-clicking should select in the range that is displayed)
     *
     * @returns {[object]}
     */
    function getDisplayedData() {
        if (!reactTableRef.current) {
            // eslint-disable-next-line
            console.warn(
                "Trying to get data displayed in a ReactTable, but no ref has been created"
            );
            return [];
        }
        try {
            return reactTableRef.current
                .getWrappedInstance()
                .getResolvedState()
                .sortedData.map((x) => x._original);
        } catch (e) {
            return [];
        }
    }

    // Every time `selection` changes, compute whether everything visible
    // is selected
    React.useEffect(() => {
        let allSelected = false;
        const displayedData = getDisplayedData();
        if (
            displayedData.length > 0 &&
            displayedData.every(
                (row) => _selected.has(row.id) || row.id == null
            )
        ) {
            allSelected = true;
        }
        setAllSelected(allSelected);
    }, [_selected, filterStrings]);

    function onToggleRow(ref, shiftOn, row) {
        // The shift key isn't held. Only select a single item
        if (!shiftOn) {
            const newSelectedState = !_selected.has(row.id);
            const newSelected = new Set(_selected);
            if (newSelectedState === true) {
                newSelected.add(row.id);
                _setSelected(newSelected);
                setLastSelected(row.id);
            } else {
                newSelected.delete(row.id);
                _setSelected(newSelected);
                setLastSelected(null);
            }
            return;
        }
        // The shift key was held, but nothing was "last clicked", so we should treat it
        // as if the shift weren't held
        if (shiftOn && lastSelected == null) {
            return onToggleRow(ref, false, row);
        }
        // The shift key was held and there was a last selected, so select everything
        // in the range between the newly clicked row and the last clicked row

        // Get the displayed row data so we don't miss-select things.
        const rowIds = getDisplayedData().map((row) => row.id);
        const lastSelectedIndex = rowIds.indexOf(lastSelected);
        if (lastSelectedIndex === -1) {
            // If the "last selected" thing is hidden, we should behave like the no-shift case
            return onToggleRow(ref, false, row);
        }
        const selectedIndex = rowIds.indexOf(row.id);
        const [start, end] = [
            Math.min(lastSelectedIndex, selectedIndex),
            Math.max(lastSelectedIndex, selectedIndex),
        ];

        _setSelected(
            new Set([
                ..._selected,
                ...rowIds.filter((v, i) => i <= end && i >= start),
            ])
        );
    }

    function onToggleAll() {
        // If everything is selected, set the selected status to `false`
        // otherwise, set it to true.
        const rowIds = getDisplayedData().map((row) => row.id);
        if (allSelected) {
            const newSelected = new Set(_selected);
            for (const id of rowIds) {
                newSelected.delete(id);
            }
            _setSelected(newSelected);
        } else {
            _setSelected(new Set([..._selected, ...rowIds]));
        }
    }

    const pageSize = displayData?.length || 20;
    let tableComponent = (
        <SelectTable
            ref={reactTableRef}
            data={displayData}
            columns={columns}
            toggleSelection={onToggleRow}
            selectAll={allSelected}
            toggleAll={onToggleAll}
            isSelected={isSelected}
            selectType="checkbox"
            keyField="id"
            showPagination={false}
            defaultPageSize={pageSize}
            pageSize={pageSize}
            minRows={1}
        />
    );
    // if `selected` was not passed in, the table rows should not be selectable
    if (selected == null) {
        tableComponent = <ReactTable columns={columns} data={displayData} />;
    }

    function removeFilterString(filterString) {
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

    const displayFilterStrings = filterStrings.filter((s) => strip(s));

    return (
        <div className="filterable-table-container">
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
                    <span className="filter-table-filtering-by">
                        Filtering by:
                    </span>
                )}
                {displayFilterStrings.map((filterString) => (
                    <Badge
                        className="filter-chip"
                        pill
                        variant="light"
                        key={filterString}
                    >
                        {filterString}
                        <FaTimes
                            className="filter-chip-icon"
                            title="Remove filter"
                            onClick={() => removeFilterString(filterString)}
                        />
                    </Badge>
                ))}
            </div>
            <div className="filterable-table-table">{tableComponent}</div>
        </div>
    );
}
FilterableTable.propTypes = {
    selected: PropTypes.array,
    setSelected: PropTypes.func,
    data: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            Header: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
            accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        })
    ),
};

export { FilterableTable };
