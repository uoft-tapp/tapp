import React from "react";
import PropTypes from "prop-types";
import Table from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";

const SelectTable = selectTableHOC(Table);

export class CustomTable extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                first_name: PropTypes.string,
                last_name: PropTypes.string,
                emily: PropTypes.string,
                position_title: PropTypes.string,
                first_time_ta: PropTypes.bool,
                status: PropTypes.string,
                nag_count: PropTypes.number
            })
        ).isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            keyField: "id",
            data: this.props.data,
            selectedRows: [],
            selectAll: false
        };
    }

    filterMethod = (filter, row) => {
        // filter.id is the column name
        console.log(filter);

        let value = row[filter.id].toString().toLowerCase();
        let filterValue = filter.value.toLowerCase();
        if (filterValue.includes(" ")) {
            return filterValue
                .split(" ")
                .every(f => value && value.indexOf(f) !== -1);
        } else {
            return value && value.indexOf(filterValue) !== -1;
        }
    };

    /**
     * Toggle a single checkbox for select table
     */
    toggleSelection = (key, shift, row) => {
        // start off with the existing state
        let selectedRows = [...this.state.selectedRows];
        const keyIndex = selectedRows.indexOf(key);

        // check to see if the key exists
        if (keyIndex >= 0) {
            // it does exist so we will remove it using destructing
            selectedRows = [
                ...selectedRows.slice(0, keyIndex),
                ...selectedRows.slice(keyIndex + 1)
            ];
        } else {
            // it does not exist so add it
            selectedRows.push(key);
        }
        // update the state
        this.setState({ selectedRows });
    };

    /**
     * Toggle all checkboxes for select table
     */
    toggleAll = () => {
        const { keyField } = this.props;
        const selectAll = !this.state.selectAll;
        const selectedRows = [];

        if (selectAll) {
            // we need to get at the internals of ReactTable
            const wrappedInstance = this.checkboxTable.getWrappedInstance();
            // the 'sortedData' property contains the currently accessible records based on the filter and sort
            const currentRecords = wrappedInstance.getResolvedState()
                .sortedData;
            // we just push all the IDs onto the selectedRows array
            currentRecords.forEach(item => {
                selectedRows.push(`select-${item._original[keyField]}`);
            });
        }
        this.setState({ selectAll, selectedRows });
    };

    /**
     * Whether or not a row is selected for select table
     */
    isSelected = k => {
        return this.state.selectedRows.includes(`select-${k}`);
    };

    rowFn = (state, rowInfo, column, instance) => {
        const { selectedRows } = this.state;

        return {
            onClick: (e, handleOriginal) => {
                console.log("It was in this row:", rowInfo);

                // IMPORTANT! React-Table uses onClick internally to trigger
                // events like expanding SubComponents and pivots.
                // By default a custom 'onClick' handler will override this functionality.
                // If you want to fire the original onClick handler, call the
                // 'handleOriginal' function.
                if (handleOriginal) {
                    handleOriginal();
                }
            },
            style: {
                background:
                    rowInfo &&
                    selectedRows.includes(`select-${rowInfo.original.id}`) &&
                    "lightblue"
            }
        };
    };

    render() {
        return (
            <SelectTable
                filterable
                defaultFilterMethod={this.filterMethod}
                {...this.props}
                ref={r => (this.checkboxTable = r)}
                toggleSelection={this.toggleSelection}
                selectAll={this.state.selectAll}
                selectType="checkbox"
                toggleAll={this.toggleAll}
                isSelected={this.isSelected}
                getTrProps={this.rowFn}
                defaultPageSize={20}
                style={{
                    height: "800px" // This will force the table body to overflow and scroll, since there is not enough room
                }}
            />
        );
    }
}
