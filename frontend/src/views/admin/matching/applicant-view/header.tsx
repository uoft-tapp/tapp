import React from "react";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { setApplicantViewMode, applicantViewModeSelector } from "../actions";
import { FaFilter, FaTable, FaTh } from "react-icons/fa";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { SortBar } from "../sorts";
import { SortListItem } from "../sorts/sorts";
import { FilterModal } from "../filters";
import { FilterType } from "../filters/filters";
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
    filterList: Record<FilterType, any[]>;
    setFilterList: (arg0: Record<FilterType, any[]>) => void;
    sortList: SortListItem[];
    setSortList: (arg0: SortListItem[]) => void;
}) {
    return (
        <div className="matching-course-header">
            <div className="search-container">
                <div className="form-inline">
                    <input
                        className="form-control mr-sm-2 search-bar"
                        type="text"
                        placeholder="Filter by name/UTORid..."
                        onChange={(e) => setFilterString(e.target.value)}
                    />
                </div>
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
    const applicantViewMode = useSelector(applicantViewModeSelector);

    return (
        <ToggleButtonGroup
            type="radio"
            name="views"
            defaultValue={applicantViewMode}
            onChange={(e) => dispatch(setApplicantViewMode(e))}
        >
            <ToggleButton
                id="toggle-FaTh"
                className="no-highlight"
                value={"grid"}
            >
                <FaTh />
            </ToggleButton>
            <ToggleButton
                id="toggle-FaTable"
                className="no-highlight"
                value={"table"}
            >
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
    filterList: Record<FilterType, any[]>;
    setFilterList: (arg0: Record<FilterType, any[]>) => void;
}) {
    const [show, setShow] = React.useState(false);
    const numActiveFilters: number = React.useMemo(() => {
        let count = 0;
        for (const filterType in filterList) {
            count += filterList[filterType as FilterType].length;
        }
        return count;
    }, [filterList]);

    return (
        <>
            <div className="filter-button-container">
                <FaFilter
                    className={classNames("filter-button", {
                        active: numActiveFilters > 0,
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
