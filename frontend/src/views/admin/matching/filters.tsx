import { Modal, Button, Form } from "react-bootstrap";
import { Position } from "../../../api/defs/types";
import { ApplicantSummary } from "./types";

export type FilterListItem = {
    section: string;
    value: string;
};

type FilterMapItem = {
    filterFunc: Function;
    values: FilterMapItemValue[];
};

type FilterMapItemValue = {
    value: string;
    label: string;
};

const filterMap: Record<string, FilterMapItem> = {
    Program: {
        filterFunc: filterProgram,
        values: [
            {
                value: "PD",
                label: "Postdoc",
            },
            {
                value: "P",
                label: "PhD",
            },
            {
                value: "M",
                label: "Masters",
            },
            {
                value: "MScAC",
                label: "MScAC",
            },
            {
                value: "U",
                label: "Undergraduate",
            },
        ],
    },
};

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
    let filterListIndex = -1;
    for (let index = 0; index < filterList.length; index++) {
        if (
            filterList[index].section === section &&
            filterList[index].value === value
        ) {
            filterListIndex = index;
        }
    }

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
        <>
            <Modal show={showFilters}>
                <Modal.Header>
                    <Modal.Title>Filter Applicants</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {Object.keys(filterMap).map((section) => {
                            return (
                                <Form.Group className="mb-3">
                                    <Form.Label>{section}</Form.Label>
                                    {filterMap[section]["values"].map(
                                        (item: FilterMapItemValue) => {
                                            return (
                                                <FilterCheckbox
                                                    value={item["value"]}
                                                    label={item["label"]}
                                                    section={section}
                                                    filterList={filterList}
                                                    setFilterList={
                                                        setFilterList
                                                    }
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
                    <Button
                        onClick={() => setShowFilters(false)}
                        variant="light"
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export function applyFilters(
    applicantSummaries: ApplicantSummary[],
    filterList: FilterListItem[],
    position: Position | null
) {
    if (!applicantSummaries || filterList.length === 0 || !position) {
        return applicantSummaries;
    }

    let filteredList: ApplicantSummary[] = [...applicantSummaries];

    // Create buckets
    const filterBuckets: Record<string, string[]> = {};

    for (const filterItem of filterList) {
        const bucket = filterBuckets[filterItem.section] || [];
        bucket.push(filterItem.value);
        filterBuckets[filterItem.section] = bucket;
    }

    // Apply filters for each type
    for (const key of Object.keys(filterBuckets)) {
        // Return early if this key doesn't exist in the filter map for some reason
        if (!Object.keys(filterMap).includes(key)) {
            return;
        }

        // Call the section's filter function
        filteredList = filterMap[key]["filterFunc"](
            filteredList,
            filterBuckets[key]
        );
    }

    return filteredList;
}

function filterProgram(
    applicantSummaries: ApplicantSummary[],
    excludeValues: string[]
) {
    if (!applicantSummaries || excludeValues.length === 0) {
        return applicantSummaries;
    }

    return (
        applicantSummaries.filter(
            (applicantSummary) =>
                applicantSummary &&
                applicantSummary.application &&
                applicantSummary.application.program &&
                !excludeValues.includes(applicantSummary.application.program)
        ) || []
    );
}
