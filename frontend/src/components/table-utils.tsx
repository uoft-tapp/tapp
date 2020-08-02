import React from "react";

/**
 * Wraps `name` in a div with a `title` attribute, so you can
 * see the full `name` on hover.
 *
 * @export
 * @param {string} name
 * @returns
 */
export function generateHeaderCell(name: string) {
    function header() {
        return (
            <div title={name} className="table-header">
                {name}
            </div>
        );
    }
    header.toString = () => name;

    return header as () => JSX.Element;
}
