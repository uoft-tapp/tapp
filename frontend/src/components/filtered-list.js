import React from "react";

export function FilteredList(props) {
    const { data, listRenderer, ...rest } = props;
    const Renderer = listRenderer;

    const filter = data => {
        const filtered = data;
        return filtered;
    };

    const filteredData = filter(data);

    return (
        <div>
            <Renderer data={filteredData} {...rest} />
        </div>
    );
}
