import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";

import "react-table/react-table.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Badge } from "react-bootstrap";
import { strip } from "../libs/utils";

// This HOC adds a checkbox to every row of a ReactTable
const SelectTable = selectTableHOC(ReactTable);

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

    const [filterStrings, setFilterStrings] = React.useState([]);
    const [currentFilterString, setCurrentFilterString] = React.useState("");
    const [lastSelected, setLastSelected] = React.useState(null);
    const [allSelected, setAllSelected] = React.useState(false);
    function isSelected(id) {
        return _selected.has(id);
    }

    const filteredData = data
        .filter((row) =>
            filterStrings.every((string) =>
                rowToStr(row).match(string.toLowerCase())
            )
        )
        .filter(
            (row) =>
                currentFilterString
                    ? rowToStr(row).includes(currentFilterString.toLowerCase())
                    : true // if there is no typed query, don't filter the typed query
        );

    // we need a reference to the internal table so that we can get the "visible data"
    // if it happens to be filtered or sorted
    let reactTableRef = React.useRef(null);
    /**
     * Gets the data that is actually displayed in the ReactTable. This is useful
     * for range selecting (shift-cliking should select in the range that is displayed)
     *
     * @returns {[object]}
     */
    function getDisplayedData() {
        if (!reactTableRef) {
            // eslint-disable-next-line
            console.warn(
                "Trying to get data displayed in a ReactTable, but no ref has been created"
            );
            return [];
        }
        try {
            return reactTableRef
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

    let tableComponent = (
        <SelectTable
            ref={(r) => (reactTableRef = r)}
            data={filteredData}
            columns={columns}
            toggleSelection={onToggleRow}
            selectAll={allSelected}
            toggleAll={onToggleAll}
            isSelected={isSelected}
            selectType="checkbox"
            keyField="id"
            minRows={1}
            showPagination={false}
        />
    );
    // if `selected` was not passed in, the table rows should not be selectable
    if (selected == null) {
        tableComponent = <ReactTable columns={columns} data={filteredData} />;
    }

    function removeFilterString(filterString) {
        const updatedFilterStrings = filterStrings.filter(
            (oldString) => oldString !== filterString
        );
        setFilterStrings(updatedFilterStrings);
    }

    function addFilterString(filterString) {
        // string.localeCompare(, , { sensitivity: 'accent'}) == case insensitive string comparison
        if (
            filterStrings.every(
                (filteredString) =>
                    filteredString.localeCompare(filterString, undefined, {
                        sensitivity: "accent",
                    }) !== 0
            )
        ) {
            setFilterStrings([...filterStrings, filterString]);
        }
    }

    return (
        <div className="filterable-table-container">
            <div className="filterable-table-filter">
                <FaSearch className="mr-3" />
                <input
                    type="text"
                    placeholder="Filter by..."
                    onChange={(e) => {
                        // "live filter" the table as you type a query
                        setCurrentFilterString(strip(e.target.value));
                    }}
                    onKeyDown={(e) => {
                        // press enter to add the typed query to the filter list
                        if (e.keyCode === 13) {
                            // 13 == Enter
                            addFilterString(strip(e.target.value));
                            e.target.value = ""; // clear the filter box
                        }
                    }}
                />
                {filterStrings.map((filterString) => (
                    <Badge
                        className="filter-chip"
                        pill
                        variant="light"
                        key={filterString}
                    >
                        {filterString}
                        <FaTimes
                            className="filter-chip-icon"
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
            Header: PropTypes.string,
            accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        })
    ),
};

export { FilterableTable };
