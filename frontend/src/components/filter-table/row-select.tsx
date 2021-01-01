import React from "react";
import { actions } from "react-table";

// We use react-tables reducer to store data
actions.setLastSelectedRow = "setLastSelectedRow";

const NOOP_FUNCTION = () => {};

function listsEqual(l1: any[], l2: any[]): boolean {
    if (l1.length !== l2.length) {
        return false;
    }
    for (const elm of l1) {
        if (!l2.includes(elm)) {
            return false;
        }
    }
    return true;
}

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
function insertOrDelete<T>(arr: T[], elm: T, insert: boolean): T[] {
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
    isHiddenRowsSelected: boolean;
    isSomeRowsSelected: boolean;
} {
    return {
        isAllRowsSelected:
            visible.every((x) => selected.includes(x)) && visible.length > 0,
        isHiddenRowsSelected: selected.some((x) => !visible.includes(x)),
        isSomeRowsSelected: selected.length > 0,
    };
}

/**
 * Compute what should be selected when a shift-click is performed
 * between `lastRowSelected` and `newRowSelected`. This function mutates `selection`.
 *
 * @param {number[]} selection
 * @param {number[]} visible
 * @param {(number | null)} lastRowSelected
 * @param {number} newRowSelected
 * @returns {number[]}
 */
function computeBulkSelection(
    selection: number[],
    visible: number[],
    lastRowSelected: number | null,
    newRowSelected: number
): number[] {
    if (
        lastRowSelected == null ||
        !visible.includes(lastRowSelected) ||
        !visible.includes(newRowSelected)
    ) {
        return insertOrDelete([...selection], newRowSelected, true);
    }
    let start = visible.indexOf(lastRowSelected);
    let end = visible.indexOf(newRowSelected);
    if (start > end) {
        [start, end] = [end, start];
    }
    const additionalSelection = visible.slice(start, end);
    for (const id of additionalSelection) {
        insertOrDelete(selection, id, true);
    }
    return selection;
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

/**
 * A header component that displays a "toggle select all" checkbox.
 *
 * @param {{
 *     isAllRowsSelected: boolean;
 *     isSomeRowsSelected: boolean;
 *     selected?: number[];
 *     visible?: number[];
 *     setSelected: Function;
 * }}
 */
function CheckboxHeader({
    isAllRowsSelected,
    isSomeRowsSelected,
    isHiddenRowsSelected,
    selected,
    visible,
    setSelected,
}: {
    isAllRowsSelected: boolean;
    isSomeRowsSelected: boolean;
    isHiddenRowsSelected: boolean;
    selected?: number[];
    visible?: number[];
    setSelected: Function;
}) {
    return (
        <IndeterminateCheckbox
            checked={isAllRowsSelected}
            indeterminate={
                isSomeRowsSelected &&
                (!isAllRowsSelected || isHiddenRowsSelected)
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
}

function CheckboxCell({
    row,
    selected,
    visible,
    setSelected,
    lastRowSelected,
    setLastRowSelected,
}: any) {
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
            onChange={NOOP_FUNCTION}
            onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                if (selected && setSelected) {
                    const newCheckedState = e.currentTarget.checked;

                    let newSelected = insertOrDelete(
                        [...selected],
                        id,
                        newCheckedState
                    );

                    if (newCheckedState) {
                        // If we shift-clicked, we want to do a special selection,
                        // so keep track of what the last row we shift-clicked was.
                        if (e.shiftKey) {
                            computeBulkSelection(
                                newSelected,
                                visible,
                                lastRowSelected,
                                id
                            );
                        }
                        setLastRowSelected(id);
                    } else {
                        setLastRowSelected(null);
                    }

                    if (!listsEqual(newSelected, selected)) {
                        setSelected(newSelected);
                    }
                }
            }}
        />
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
 * }}
 */
export function generateSelectionHook({
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

    // Code modified from useRowSelect example https://react-table.tanstack.com/docs/api/useRowSelect
    return (hooks: any) => {
        const [lastRowSelected, setLastRowSelected] = React.useState<
            number | null
        >(null);

        hooks.visibleColumns.push((columns: any[]) => [
            // Let's make a column for selection
            {
                id: "selection",
                // The header can use the table's getToggleAllRowsSelectedProps method
                // to render a checkbox
                Header: CheckboxHeader,
                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: CheckboxCell,
                maxWidth: 45,
            },
            ...columns,
        ]);

        // Dynamically computed values are available on the `instance`
        // object, so we should append the selection-state information we need.
        hooks.useInstance.push(
            useInstanceFactory({
                selected: selected || [],
                setSelected: setSelected || NOOP_FUNCTION,
                lastRowSelected,
                setLastRowSelected,
            })
        );
    };
}

/**
 * Create a `useInstance` function to be installed as a hook to a react-table.
 * This is needed because we want to include `selected` and `setSelected` in
 * via closure.
 *
 * @param {({
 *     selected: number[];
 *     setSelected: Function;
 *     lastRowSelected?: number | null;
 *     setLastRowSelected?: Function;
 * })} {
 *     selected,
 *     setSelected,
 *     lastRowSelected,
 *     setLastRowSelected,
 * }
 * @returns
 */
function useInstanceFactory({
    selected,
    setSelected,
    lastRowSelected,
    setLastRowSelected,
}: {
    selected: number[];
    setSelected: Function;
    lastRowSelected?: number | null;
    setLastRowSelected?: Function;
}) {
    return React.useCallback(
        function useInstance(instance: any) {
            const rows: any[] = instance.rows;

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
                isHiddenRowsSelected,
            } = computeSelectionState(selected, visible);

            Object.assign(instance, {
                isAllRowsSelected,
                isSomeRowsSelected,
                isHiddenRowsSelected,
                selected,
                visible,
                setSelected,
                lastRowSelected,
                setLastRowSelected,
            });
        },
        [selected, setSelected, lastRowSelected, setLastRowSelected]
    );
}
