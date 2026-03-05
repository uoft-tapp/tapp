import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * Renders a component that filters and renders a list of objects.
 *
 * The data is filtered based on the filter prop function, which takes
 * as input the data and the query from the search box.
 *
 * The filtered data is rendered using the listRenderer prop.
 *
 * @export
 * @param {list[object]} props.data
 * @param {component} props.listRenderer
 * @param {function(list[object], string): list[object]} props.filterFunc
 */
export function FilteredList<T, R extends React.ComponentProps<any>>(
    props: {
        data: T[];
        filterFunc: (dat: T[], query: string) => T[];
        listRenderer: React.FunctionComponent<{ data: T[] } & R>;
    } & R
) {
    const { data, listRenderer, filterFunc, ...rest } = props;
    const Renderer = listRenderer;
    const [query, setQuery] = useState("");

    let filteredData = filterFunc(data, query);

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Renderer data={filteredData} {...(rest as any)} />
        </div>
    );
}

FilteredList.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
    listRenderer: PropTypes.elementType,
    filterFunc: PropTypes.func,
};
