import React from "react";

/**
 * Create a `DiffCell` that will render a field's modification if
 * one is present. Otherwise, render the original value.
 *
 * @param {*} accessor
 * @returns
 */
export function createDiffCell({ accessor, Cell }) {
    accessor = (accessor || "").split(".");
    function get(obj) {
        let ret = obj;
        for (const key of accessor) {
            if (ret == null) {
                return undefined;
            }
            ret = ret[key];
        }
        return ret;
    }

    /**
     * If a particular cell has been modified, render the "modification description".
     * Otherwise, render the actual value.
     *
     * @param {*} {original}
     * @returns
     */
    function DiffCell({ original }) {
        const value = get(original.obj);
        const changed = get(original.changes);
        if (changed != null) {
            return (
                <div
                    className="diff-changed-cell bg-primary text-white"
                    title={changed}
                >
                    {changed}
                </div>
            );
        }
        // If there is a custom cell renderer, use that. Otherwise, pass the value directly.
        return Cell ? Cell({ value, original: original.obj }) : value;
    }
    return DiffCell;
}

/**
 * Take a react table column specification and convert it to a specification for a diff table.
 *
 * @param {*} columns
 * @returns
 */
export function createDiffColumnsFromColumns(columns) {
    return columns.map((column) => {
        const ret = { ...column, Cell: createDiffCell(column) };
        delete ret.accessor;
        return ret;
    });
}
