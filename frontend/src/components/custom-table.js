import React from "react";
import Table from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import "./components.css";

const SelectTable = selectTableHOC(Table);

export class CustomTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyField: this.props.keyField,
            data: this.props.data,
            selectedRows: [],
            selectedIds: [],
            selectAll: false
        };
    }

    /**
     * Filter method used by custom table to filter out rows. Returns true if a row
     * contains substring that matches filter.
     *
     * In case of multiple filters where each filter is seperated by empty space,
     * we will join the filters by an OR relation.
     *
     * @param {string} filter
     * @param {object} row
     * @return {boolean}
     */
    filterMethod = (filter, row) => {
        let value = row[filter.id].toString().toLowerCase();
        let filterValue = filter.value.toLowerCase();
        // split to array and check if matched filter strings
        return filterValue
            .split(" ")
            .some(f => value && value.indexOf(f) !== -1);
    };

    /**
     * Toggle a single checkbox for select table.
     *
     * @param {string} key A str of the form "select-{id}" where id is the data id
     * @param {boolean} shift A boolean indicating whether shift key is pressed or not
     * @param {object} row A row object
     */
    toggleSelection = (key, shift, row) => {
        const { keyField } = this.props;
        // access internal filteredData via: https://github.com/tannerlinsley/react-table/wiki/FAQ#how-do-i-get-at-the-internal-data-so-i-can-do-things-like-exporting-to-a-file
        const wrappedInstance = this.internalTable.getWrappedInstance();
        // the 'sortedData' property contains the currently accessible records based on the filter and sort
        const currentRecords = wrappedInstance.getResolvedState().sortedData;

        // start off with the existing state
        let selectedRows = [...this.state.selectedRows];
        let selectedIds = [...this.state.selectedIds];
        const keyIndex = selectedRows.indexOf(key);

        // check to see if the key exists
        if (keyIndex >= 0) {
            // it does exist so we will remove it using destructing
            selectedRows = [
                ...selectedRows.slice(0, keyIndex),
                ...selectedRows.slice(keyIndex + 1)
            ];
            selectedIds = [
                ...selectedIds.slice(0, keyIndex),
                ...selectedIds.slice(keyIndex + 1)
            ];
        } else {
            if (shift) {
                let lastId = selectedIds[selectedIds.length - 1];
                let lastIndex = currentRecords.findIndex(
                    x => x._original[keyField] === lastId
                );
                let currIndex = currentRecords.findIndex(
                    x => x._original[keyField] === row[keyField]
                );
                for (
                    let i = Math.min(lastIndex, currIndex) + 1;
                    i < Math.max(lastIndex, currIndex);
                    i++
                ) {
                    selectedRows.push(
                        `select-${currentRecords[i]._original[keyField]}`
                    );
                    selectedIds.push(currentRecords[i]._original[keyField]);
                }
            }
            // it does not exist so add it
            selectedRows.push(key);
            selectedIds.push(row[keyField]);
            // console.log(selectedRows);
        }
        // update the state and send selected rows
        this.setState({ selectedRows, selectedIds });
        this.props.setSelectedRows(selectedIds);
    };

    /**
     * Toggle all checkboxes for select table
     */
    toggleAll = () => {
        const { keyField } = this.props;
        const selectAll = !this.state.selectAll;
        const selectedRows = [];
        const selectedIds = [];

        if (selectAll) {
            // access internal filteredData via: https://github.com/tannerlinsley/react-table/wiki/FAQ#how-do-i-get-at-the-internal-data-so-i-can-do-things-like-exporting-to-a-file
            const wrappedInstance = this.internalTable.getWrappedInstance();
            // the 'sortedData' property contains the currently accessible records based on the filter and sort
            const currentRecords = wrappedInstance.getResolvedState()
                .sortedData;
            // we just push all the IDs onto the selectedRows array
            currentRecords.forEach(item => {
                selectedRows.push(`select-${item._original[keyField]}`);
                selectedIds.push(item._original[keyField]);
            });
        }
        this.setState({ selectAll, selectedRows, selectedIds });
        this.props.setSelectedRows(selectedIds);
    };

    /**
     * Whether or not a row is selected for select table
     *
     * @param {int} k keyField id
     * @return {boolean}
     */
    isSelected = k => {
        return this.state.selectedRows.includes(`select-${k}`);
    };

    /**
     * Return a react-table's Tr element's prop to be updated
     *
     * @param {object} state
     * @param {object} rowInfo
     * @param {object} column
     * @param {object} instance
     * @return {object}
     */
    rowFn = (state, rowInfo, column, instance) => {
        const { selectedRows } = this.state;
        const { keyField } = this.props;

        return {
            // triggered when the row is clicked
            onClick: (e, handleOriginal) => {
                this.toggleSelection(
                    `select-${rowInfo.original[keyField]}`,
                    null,
                    rowInfo.original
                );

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
                defaultPageSize={500}
            />
        );
    }
}
