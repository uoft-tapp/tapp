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

        let value = row[filter.id].toString().toLowerCase();
        let filterValue = filter.value.toLowerCase();
        // split to array and check if matched filter strings
        return filterValue
            .split(" ")
            .some(f => value && value.indexOf(f) !== -1);
    };

    /**
     * Toggle a single checkbox for select table
     */
    toggleSelection = (key, shift, row) => {
        // key is a str "select-{id}" where id is the data id

        const { keyField } = this.props;
        // access internal filteredData via: https://github.com/tannerlinsley/react-table/wiki/FAQ#how-do-i-get-at-the-internal-data-so-i-can-do-things-like-exporting-to-a-file
        const wrappedInstance = this.internalTable.getWrappedInstance();
        // the 'sortedData' property contains the currently accessible records based on the filter and sort
        const currentRecords = wrappedInstance.getResolvedState()
            .sortedData;

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
            if(shift) {
                let lastId = parseInt(selectedRows[selectedRows.length - 1].replace(/[^0-9.]/g, ''), 10);
                let lastIndex = currentRecords.findIndex( x => x._original[keyField] === lastId );
                let currIndex = currentRecords.findIndex( x => x._original[keyField] === row.id );
                for(let i = Math.min(lastIndex, currIndex) + 1; i < Math.max(lastIndex, currIndex); i++){
                    selectedRows.push(`select-${currentRecords[i]._original[keyField]}`);
                }
            }
            // it does not exist so add it
            selectedRows.push(key);
            console.log(selectedRows);
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
            // access internal filteredData via: https://github.com/tannerlinsley/react-table/wiki/FAQ#how-do-i-get-at-the-internal-data-so-i-can-do-things-like-exporting-to-a-file
            const wrappedInstance = this.internalTable.getWrappedInstance();
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
                ref={r => (this.internalTable = r)}
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
