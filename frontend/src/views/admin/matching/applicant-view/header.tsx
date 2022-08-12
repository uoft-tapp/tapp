import React from "react";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { setViewType, viewTypeSelector } from "../actions";
import { FaFilter, FaTable, FaTh } from "react-icons/fa";
import { Form, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { SortBar, SortListItem } from "../sorts";
import { FilterModal } from "../filters";
import { FilterListItem } from "../filters/filters";
import { PositionSummary } from "../types";

/**
 * The header of the applicant view containing a search bar, filter button,
 * sort bar, and toggle button group for switching between grid/table view.
 */
export function ApplicantViewHeader({
    positionSummary,
    setFilterString,
    filterList,
    setFilterList,
    sortList,
    setSortList,
}: {
    positionSummary: PositionSummary | null;
    setFilterString: (arg0: string) => void;
    filterList: FilterListItem[];
    setFilterList: (arg0: FilterListItem[]) => void;
    sortList: SortListItem[];
    setSortList: (arg0: SortListItem[]) => void;
}) {
    return (
        <div className="matching-course-header">
            <div className="search-container">
                <Form inline>
                    <Form.Control
                        type="text"
                        placeholder="Filter by name/UTORid..."
                        className="mr-sm-2"
                        onChange={(e) => setFilterString(e.target.value)}
                    />
                </Form>
                <ApplicantFilterButton
                    filterList={filterList}
                    setFilterList={setFilterList}
                />
                <SortBar sortList={sortList} setSortList={setSortList} />
                <div className="container-filler"></div>
                <DisplayToggle />
            </div>
            <h2>{positionSummary?.position.position_code}</h2>
        </div>
    );
}

/**
 * A pair of buttons to toggle between viewing applicant information in grid or table view.
 */
function DisplayToggle() {
    const dispatch = useThunkDispatch();
    const viewType = useSelector(viewTypeSelector);

    return (
        <ToggleButtonGroup
            type="radio"
            name="views"
            defaultValue={viewType}
            onChange={(e) => dispatch(setViewType(e))}
        >
            <ToggleButton className="no-highlight" value={"grid"}>
                <FaTh />
            </ToggleButton>
            <ToggleButton className="no-highlight" value={"table"}>
                <FaTable />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}

/**
 * A button that displays a modal for filtering applicants by certain values.
 */
function ApplicantFilterButton({
    filterList,
    setFilterList,
}: {
    filterList: FilterListItem[];
    setFilterList: (arg0: FilterListItem[]) => unknown;
}) {
    const [show, setShow] = React.useState(false);

    return (
        <>
            <div className="filter-button-container">
                <FaFilter
                    className={classNames("filter-button", {
                        active: filterList.length > 0,
                    })}
                    onClick={() => setShow(!show)}
                />
            </div>
            <FilterModal
                showFilters={show}
                setShowFilters={setShow}
                filterList={filterList}
                setFilterList={setFilterList}
            />
        </>
    );
}
