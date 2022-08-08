import React from "react";

import { sortMap } from "./sorts";

import { Dropdown, DropdownButton } from "react-bootstrap";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { GrFormClose } from "react-icons/gr";
import "../styles.css";

export type SortListItem = {
    name: string;
    asc: boolean;
};

export const defaultSortList = [
    {
        name: "Department",
        asc: true,
    },
    {
        name: "Program",
        asc: false,
    },
    {
        name: "Year in Progress",
        asc: true,
    },
];

/**
 * A collection of dropdown lists (SortDropdown) for applying sorts.
 */
export function SortBar({
    sortList,
    setSortList,
}: {
    sortList: SortListItem[];
    setSortList: Function;
}) {
    return (
        <div className="sort-dropdown-container">
            {sortList.map((item, index) => {
                return (
                    <SortDropdown
                        key={index}
                        index={index}
                        selected={item.name}
                        sortList={sortList}
                        setSortList={setSortList}
                    />
                );
            })}
            <SortDropdown
                key={sortList.length}
                index={sortList.length}
                selected={null}
                sortList={sortList}
                setSortList={setSortList}
            />
        </div>
    );
}

/**
 * A set of items including a dropdown list of sorting types,
 * a button for specifying whether the sort should be done in ascending/descending order,
 * and a button for removing the sort from the sorting list.
 */
function SortDropdown({
    index,
    selected,
    sortList,
    setSortList,
}: {
    index: number;
    selected: string | null;
    sortList: SortListItem[];
    setSortList: Function;
}) {
    let items: SortListItem[];

    return (
        <>
            <DropdownButton
                title={selected ? selected : "Sort by... "}
                size="sm"
                variant="info"
                className="sort-dropdown"
            >
                {Object.keys(sortMap).map((item) => {
                    return (
                        <Dropdown.Item
                            key={item}
                            onSelect={() => {
                                items = [...sortList];
                                const newSortItem: SortListItem = {
                                    asc: true,
                                    name: item,
                                };

                                items[index] = newSortItem;
                                setSortList(items);
                            }}
                        >
                            {item}
                        </Dropdown.Item>
                    );
                })}
            </DropdownButton>
            {selected && (
                <div
                    className="sort-icon"
                    onClick={() => {
                        // Button for specifying ascending/descending order
                        items = [...sortList];
                        items[index] = {
                            ...items[index],
                            asc: !items[index]["asc"],
                        };
                        setSortList(items);
                    }}
                >
                    {" "}
                    {sortList[index]["asc"] ? (
                        <TiArrowSortedUp />
                    ) : (
                        <TiArrowSortedDown />
                    )}{" "}
                </div>
            )}
            {selected && (
                <div
                    className="sort-icon"
                    onClick={() => {
                        // Button for removing this sort
                        items = [...sortList];
                        items.splice(index, 1);
                        setSortList(items);
                    }}
                >
                    <GrFormClose />
                </div>
            )}
        </>
    );
}
