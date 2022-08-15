import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FilterType, filterMap } from "./filters";

export const defaultFilterList: Record<FilterType, any[]> = {
    program: [],
    department: [],
    taPositionPref: [],
    status: ["hidden"],
    hourFulfillment: [],
};

/**
 * A pop-up window containing a list of filter-able items in the form of checkboxes.
 */
export function FilterModal({
    showFilters,
    setShowFilters,
    filterList,
    setFilterList,
}: {
    showFilters: boolean;
    setShowFilters: (arg0: boolean) => void;
    filterList: Record<FilterType, any[]>;
    setFilterList: (arg0: Record<FilterType, any[]>) => void;
}) {
    // Enforcing an order for the filters to appear
    const filterTypeList: FilterType[] = [
        "department",
        "program",
        "taPositionPref",
        "status",
        "hourFulfillment",
    ];

    return (
        <Modal
            show={showFilters}
            onHide={() => {
                setShowFilters(false);
            }}
            dialogClassName="filter-modal"
        >
            <Modal.Header>
                <Modal.Title>Filter Applicants</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="filter-form">
                    {filterTypeList.map((filterKey) => {
                        return (
                            <Form.Group className="mb-3" key={filterKey}>
                                <Form.Label className="filter-section-title">
                                    {filterMap[filterKey].label}
                                </Form.Label>
                                {filterMap[filterKey].values.map(
                                    (filterValue) => {
                                        return (
                                            <FilterCheckbox
                                                key={filterValue.value}
                                                filterType={filterKey}
                                                filterItem={filterValue}
                                                filterList={filterList}
                                                setFilterList={setFilterList}
                                            />
                                        );
                                    }
                                )}
                                {filterMap[filterKey].hasOther && (
                                    // Add a checkbox for any filter key that is allowed to have an "other" value
                                    <FilterCheckbox
                                        key={`${filterKey}-other`}
                                        filterType={filterKey}
                                        filterItem={{
                                            label: "Other",
                                            value: "other",
                                        }}
                                        filterList={filterList}
                                        setFilterList={setFilterList}
                                    />
                                )}
                            </Form.Group>
                        );
                    })}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setShowFilters(false)} variant="light">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * A single checkbox item that will add or remove a filter item from "filterList" via "setFilterList".
 */
function FilterCheckbox({
    filterType,
    filterItem,
    filterList,
    setFilterList,
}: {
    filterType: FilterType;
    filterItem: { label: string; value: any };
    filterList: Record<FilterType, any[]>;
    setFilterList: (arg0: Record<FilterType, any[]>) => void;
}) {
    // Mark as unchecked if this item is in the filter list
    const filterListIndex: number = React.useMemo(() => {
        return filterList[filterType].indexOf(filterItem.value);
    }, [filterList, filterItem.value, filterType]);

    return (
        <Form.Check
            type="checkbox"
            label={filterItem.label}
            defaultChecked={filterListIndex === -1}
            onChange={() => {
                const newFilterList = { ...filterList };
                if (filterListIndex === -1) {
                    // Previously checked, now unchecked; need to add to filter list
                    newFilterList[filterType].push(filterItem.value);
                } else {
                    // Remove the value from the filter list
                    newFilterList[filterType].splice(filterListIndex, 1);
                }

                setFilterList(newFilterList);
            }}
        />
    );
}
