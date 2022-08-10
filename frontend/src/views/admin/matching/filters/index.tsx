import { Modal, Button, Form } from "react-bootstrap";
import { FilterListItem, FilterMapItemValue, filterMap } from "./filters";

export const defaultFilterList: FilterListItem[] = [
    {
        section: "Position Status",
        value: "hidden",
    },
];

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
    setShowFilters: Function;
    filterList: FilterListItem[];
    setFilterList: Function;
}) {
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
                    {Object.keys(filterMap).map((section) => {
                        return (
                            <Form.Group className="mb-3" key={section}>
                                <Form.Label className="filter-section-title">
                                    {section}
                                </Form.Label>
                                {filterMap[section]["values"].map(
                                    (item: FilterMapItemValue) => {
                                        return (
                                            <FilterCheckbox
                                                key={item["label"]}
                                                value={item["value"]}
                                                label={item["label"]}
                                                section={section}
                                                filterList={filterList}
                                                setFilterList={setFilterList}
                                            />
                                        );
                                    }
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
    value,
    label,
    section,
    filterList,
    setFilterList,
}: {
    value: string;
    label: string;
    section: string;
    filterList: FilterListItem[];
    setFilterList: Function;
}) {
    // Mark as unchecked if this item is in the filter list
    const filterListIndex = filterList.findIndex(
        (item) => item.section === section && item.value === value
    );

    return (
        <Form.Check
            key={value}
            id="default-checkbox"
            type="checkbox"
            label={label}
            defaultChecked={filterListIndex === -1}
            onChange={() => {
                let newFilterList = [...filterList];
                if (filterListIndex === -1) {
                    // Previously checked, now unchecked; need to add to filter list
                    const newItem: FilterListItem = {
                        section: section,
                        value: value,
                    };

                    newFilterList.push(newItem);
                } else {
                    // Remove from the filter list
                    newFilterList.splice(filterListIndex, 1);
                }

                setFilterList(newFilterList);
            }}
        />
    );
}
