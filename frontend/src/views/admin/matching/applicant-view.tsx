import React from "react";
import classNames from "classnames";

import { Position, Application } from "../../../api/defs/types";
import { ApplicantSummary, Match } from "./types";

import { FaFilter, FaTable, FaTh, FaLock } from "react-icons/fa";
import { BsStarFill } from "react-icons/bs";
import { RiStickyNoteFill } from "react-icons/ri";

import {
    Form,
    Table,
    Modal,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Collapse,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";

import { sum, round } from "../../../libs/utils";

import { upsertMatch, upsertNote } from "./actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

import {
    getApplicantMatchForPosition,
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "./utils";
import {
    SortDropdowns,
    applySorts,
    sortMapItem,
    defaultSortList,
} from "./sorts";
import {
    FilterModal,
    applyFilters,
    FilterListItem,
    defaultFilterList,
} from "./filters";

import { ApplicationDetails } from "../applications/application-details";

import "./styles.css";

// Mapping of status strings to better human-readable text
const statusMapping: Record<string, string[]> = {
    Assigned: ["assigned"],
    "Assigned (Staged)": ["staged-assigned"],
    Starred: ["starred"],
    Applied: ["applied"],
    Hidden: ["hidden"],
};

export function ApplicantView({
    position,
    applicants,
    markAsUpdated,
}: {
    position: Position | null;
    applicants: ApplicantSummary[];
    markAsUpdated: Function;
}) {
    const [viewType, setViewType] = React.useState<"table" | "grid">("grid");
    const [filterString, setFilterString] = React.useState("");
    const [sortList, setSortList] =
        React.useState<sortMapItem[]>(defaultSortList);

    const [showFilters, setShowFilters] = React.useState(false);
    const [filterList, setFilterList] =
        React.useState<FilterListItem[]>(defaultFilterList);

    const filteredApplicants = React.useMemo(() => {
        if (!applicants) {
            return [] as ApplicantSummary[];
        }

        // Filter applicants that match the search value
        const filteredBySearch: ApplicantSummary[] =
            applicants.filter((applicantSummary) =>
                `${applicantSummary.applicant.first_name} ${applicantSummary.applicant.last_name} ${applicantSummary.applicant.utorid}`
                    .toLowerCase()
                    .includes(filterString.toLowerCase())
            ) || [];

        // Apply filters based on filter list
        const filteredByFilters: ApplicantSummary[] =
            applyFilters(filteredBySearch, filterList, position) || [];

        // Apply sorts based on sort lists
        applySorts(filteredByFilters, sortList, position);

        return filteredByFilters;
    }, [filterString, sortList, filterList, applicants, position]);

    return (
        <div className="matching-course-main">
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
                    <div className="filter-button-container">
                        <FaFilter
                            className={classNames("filter-button", {
                                active: filterList.length > 0,
                            })}
                            onClick={() => setShowFilters(!showFilters)}
                        />
                    </div>
                    <SortDropdowns
                        sortList={sortList}
                        setSortList={setSortList}
                    />
                    <div className="container-filler"></div>
                    <ToggleButtonGroup
                        id="view-toggle"
                        type="radio"
                        name="views"
                        defaultValue={viewType}
                        onChange={setViewType}
                    >
                        <ToggleButton
                            className="no-highlight"
                            id="tbg-radio-1"
                            value={"grid"}
                        >
                            <FaTh />
                        </ToggleButton>
                        <ToggleButton
                            className="no-highlight"
                            id="tbg-radio-2"
                            value={"table"}
                        >
                            <FaTable />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <h2>{position && position.position_code}</h2>
            </div>
            <div className="matching-course-body">
                {position &&
                    (viewType === "table" ? (
                        <TableView
                            position={position}
                            applicantSummaries={filteredApplicants}
                            markAsUpdated={markAsUpdated}
                        />
                    ) : (
                        <GridView
                            position={position}
                            applicantSummaries={filteredApplicants}
                            markAsUpdated={markAsUpdated}
                        />
                    ))}
                {position && (
                    // Footer to show info about how many applicants are visible/hidden
                    <div className="applicant-count">{`Showing ${
                        filteredApplicants.length
                    }/${applicants.length} applicants ${
                        applicants.length - filteredApplicants.length > 0
                            ? `(${
                                  applicants.length - filteredApplicants.length
                              } hidden)`
                            : ""
                    }`}</div>
                )}
            </div>
            <FilterModal
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterList={filterList}
                setFilterList={setFilterList}
            />
        </div>
    );
}

/**
 * A presentation of applicant information in table view.
 *
 * @param {*} props
 * @returns
 */
function TableView({
    position,
    applicantSummaries,
    markAsUpdated,
}: {
    position: Position;
    applicantSummaries: ApplicantSummary[];
    markAsUpdated: Function;
}) {
    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Last</th>
                    <th>First</th>
                    <th>UTORid</th>
                    <th>Department</th>
                    <th>Program</th>
                    <th>YIP</th>
                    <th>GPA</th>
                    <th>TA Rating</th>
                    <th>Instructor Rating</th>
                    <th>Assignments</th>
                    <th>Hours Assigned</th>
                    <th>Hours Previously Assigned</th>
                    <th>Guarantee Total</th>
                </tr>
            </thead>
            <tbody>
                {applicantSummaries.map((applicantSummary) => {
                    return (
                        <TableRow
                            applicantSummary={applicantSummary}
                            position={position}
                            markAsUpdated={markAsUpdated}
                            key={applicantSummary.applicant.id}
                        />
                    );
                })}
            </tbody>
        </Table>
    );
}

/**
 * Gets the human-friendly name for a match's status.
 *
 * @param {*} match
 * @returns {string}
 */
function getMappedStatusForMatch(match: Match | null) {
    if (!match) {
        return null;
    }

    return Object.keys(statusMapping).find((key) =>
        statusMapping[key].includes(match.status)
    );
}

/**
 * A row of applicant information to be presented in a table (TableView).
 *
 * @param {*} props
 * @returns
 */
function TableRow({
    position,
    applicantSummary,
    markAsUpdated,
}: {
    position: Position;
    applicantSummary: ApplicantSummary;
    markAsUpdated: Function;
}) {
    const applicantMatch = getApplicantMatchForPosition(
        applicantSummary,
        position
    );
    const statusCategory = getMappedStatusForMatch(applicantMatch);
    const positionPref = getPositionPrefForPosition(
        applicantSummary.application,
        position
    );

    const instructorRatings =
        applicantSummary.application.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            }) || [];

    return (
        <tr>
            <td>
                {statusCategory}{" "}
                {statusCategory === "Assigned"
                    ? `(${applicantMatch?.hoursAssigned || "0"})`
                    : ""}
            </td>
            <td>{applicantSummary.applicant.last_name}</td>
            <td>{applicantSummary.applicant.first_name}</td>
            <td>{applicantSummary.applicant.utorid}</td>
            <td>{applicantSummary.application.department}</td>
            <td>{applicantSummary.application.program}</td>
            <td>{applicantSummary.application.yip}</td>
            <td>{applicantSummary.application.gpa || ""}</td>
            <td>{positionPref?.preference_level || ""}</td>
            <td>
                {instructorRatings.length > 0
                    ? round(
                          sum(...instructorRatings) / instructorRatings.length,
                          3
                      ) +
                      (instructorRatings.length > 1
                          ? ` (${instructorRatings.length})`
                          : "")
                    : ""}
            </td>
            <td>
                {applicantSummary.matches.map((match) => {
                    if (
                        match.status === "assigned" ||
                        match.status === "staged-assigned"
                    ) {
                        return `${match.positionCode} (${match.hoursAssigned})`;
                    }
                    return "";
                })}
            </td>
            <td>{getApplicantTotalHoursAssigned(applicantSummary)}</td>
            <td>{applicantSummary.guarantee?.previousHoursFulfilled || ""}</td>
            <td>{applicantSummary.guarantee?.totalHoursOwed || ""}</td>
        </tr>
    );
}

/**
 * A lock icon that can be hovered over and displays a tooltip.
 * Displayed next to the "Assigned" header so users know they cannot edit locked-in assignments.
 *
 * @param {*} props
 * @returns
 */
function LockedAssignTooltip() {
    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            These assignments can only be changed through the Assignments &
            Positions {">"} Assignments tab.
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="right"
            delay={{ show: 10, hide: 10 }}
            overlay={renderTooltip}
        >
            <FaLock className="header-lock" />
        </OverlayTrigger>
    );
}

/**
 * A presentation of applicants and their summaries in a grid-based view.
 * Applicants are divided into sections based on match status (e.g., applied, staged-assigned).
 *
 * @param {*} props
 * @returns
 */
function GridView({
    position,
    applicantSummaries,
    markAsUpdated,
}: {
    position: Position;
    applicantSummaries: ApplicantSummary[];
    markAsUpdated: Function;
}) {
    const applicantSummariesByMatchStatus: Record<string, ApplicantSummary[]> =
        {};
    Object.keys(statusMapping).map(
        (key) => (applicantSummariesByMatchStatus[key] = [])
    );

    for (const applicantSummary of applicantSummaries) {
        const applicantMatch = getApplicantMatchForPosition(
            applicantSummary,
            position
        );
        const statusCategory = getMappedStatusForMatch(applicantMatch);
        if (statusCategory) {
            applicantSummariesByMatchStatus[statusCategory].push(
                applicantSummary
            );
        }
    }

    return (
        <div>
            {Object.keys(applicantSummariesByMatchStatus).map((key) => {
                return (
                    <GridSection
                        key={key}
                        header={key}
                        applicantSummaries={
                            applicantSummariesByMatchStatus[key]
                        }
                        markAsUpdated={markAsUpdated}
                        position={position}
                    />
                );
            })}
        </div>
    );
}

/**
 * A section/collection of grid items for a specified match status (e.g., applied, staged-assigned).
 *
 * @param {*} props
 * @returns
 */
function GridSection({
    header,
    applicantSummaries,
    position,
    markAsUpdated,
}: {
    header: string;
    applicantSummaries: ApplicantSummary[];
    position: Position;
    markAsUpdated: Function;
}) {
    // Don't show the section if there are no applicants
    if (applicantSummaries.length === 0) {
        return null;
    }

    return (
        <div className="grid-view-section">
            <h4>
                {header} {header === "Assigned" ? <LockedAssignTooltip /> : ""}
            </h4>
            <div className="grid-view-list">
                {applicantSummaries.map((applicantSummary) => {
                    return (
                        <GridItem
                            applicantSummary={applicantSummary}
                            position={position}
                            markAsUpdated={markAsUpdated}
                            key={applicantSummary.applicant.id}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/**
 * A grid item to be displayed in grid view, outlining information about an applicant's summary.
 *
 * @param {*} props
 * @returns
 */
function GridItem({
    applicantSummary,
    position,
    markAsUpdated,
}: {
    applicantSummary: ApplicantSummary;
    position: Position;
    markAsUpdated: Function;
}) {
    const dispatch = useThunkDispatch();
    const applicantMatch = getApplicantMatchForPosition(
        applicantSummary,
        position
    );
    const positionPref = getPositionPrefForPosition(
        applicantSummary.application,
        position
    );

    const [open, setOpen] = React.useState(false);
    const [shownApplication, setShownApplication] =
        React.useState<Application | null>(null);
    const [showChangeHours, setShowChangeHours] = React.useState(false);

    const [hoursAssigned, setHoursAssigned] = React.useState("");

    const instructorRatings =
        applicantSummary.application.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            }) || [];

    function _upsertMatch(match: Match | null) {
        if (!match) {
            return;
        }
        return dispatch(upsertMatch(match));
    }

    async function hideApplicantFromAll() {
        // Update all of this applicant's matches except for those in which they are assigned/staged-assigned
        for (const match of applicantSummary.matches) {
            if (match.status === "applied") {
                const newMatch: Match = { ...match, status: "hidden" };
                await _upsertMatch(newMatch);
                markAsUpdated(true);
            }
        }
    }

    async function updateApplicantMatch(
        newStatus: "staged-assigned" | "hidden" | "starred" | "applied",
        hoursAssigned?: number
    ) {
        const newMatch: Match | null = applicantMatch
            ? {
                  ...applicantMatch,
                  status: newStatus,
              }
            : null;

        if (newMatch && hoursAssigned) {
            newMatch.hoursAssigned = hoursAssigned;
        }

        await _upsertMatch(newMatch);
        markAsUpdated(true);
    }

    let filledStatus: "empty" | "under" | "matched" | "over" | "" = "";
    const hoursOwed = applicantSummary.guarantee?.totalHoursOwed || 0;
    let totalAssignedHours = round(
        sum(
            ...applicantSummary.matches.map((match) => {
                if (
                    match.status === "assigned" ||
                    match.status === "staged-assigned"
                ) {
                    return match.hoursAssigned;
                }
                return 0;
            })
        ) + (applicantSummary.guarantee?.previousHoursFulfilled || 0),
        2
    );

    if (totalAssignedHours > hoursOwed) {
        filledStatus = "over";
    } else if (hoursOwed > 0) {
        if (totalAssignedHours === 0) {
            filledStatus = "empty";
        } else if (totalAssignedHours === hoursOwed) {
            filledStatus = "matched";
        } else {
            filledStatus = "under";
        }
    }

    return (
        // Entire item is marked as a dropdown trigger to access the list of actions
        <div
            className="applicant-dropdown-wrapper dropdown"
            onMouseLeave={() => setOpen(false)}
        >
            <div
                className="applicant-grid-item noselect"
                onClick={() => {
                    setOpen(!open);
                }}
            >
                <div
                    className={classNames(
                        "applicant-status-sidebar",
                        filledStatus
                    )}
                >
                    <div className="applicant-status-value">
                        {totalAssignedHours}
                    </div>
                    <div className="applicant-status-divider" />
                    <div className="applicant-status-value">{hoursOwed}</div>
                </div>
                <div className="applicant-grid-main">
                    <div className="grid-row">
                        <div className="applicant-name">
                            {applicantSummary.applicant.first_name}{" "}
                            {applicantSummary.applicant.last_name}
                        </div>
                        {applicantMatch?.status.includes("assigned") && (
                            <div className="applicant-hours">
                                {" "}
                                ({applicantMatch.hoursAssigned})
                            </div>
                        )}
                        {!applicantMatch?.status.includes("assigned") && (
                            <div
                                className="icon-container"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <ApplicantStar
                                    match={applicantMatch}
                                    updateApplicantMatch={updateApplicantMatch}
                                    markAsUpdated={markAsUpdated}
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid-row">
                        <div className="grid-detail-small">
                            {applicantSummary.application.department
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>
                        <div className="grid-detail-small">
                            {applicantSummary.application.program?.charAt(0)}
                            {applicantSummary.application.yip}
                        </div>
                        <div className="grid-detail-small">
                            {positionPref?.preference_level || ""}
                        </div>
                        <div className="grid-detail-small">
                            {instructorRatings.length > 0
                                ? round(
                                      sum(...instructorRatings) /
                                          instructorRatings.length,
                                      3
                                  )
                                : ""}
                        </div>
                        <div
                            className="icon-container"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <ApplicantNote
                                applicantSummary={applicantSummary}
                                markAsUpdated={markAsUpdated}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Collapse in={open}>
                {/* The list of dropdown actions */}
                <div className="applicant-dropdown-menu dropdown-menu noselect">
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setShownApplication(applicantSummary.application);
                            setOpen(false);
                        }}
                    >
                        View application details
                    </button>
                    {applicantMatch?.status &&
                        ["hidden", "applied", "starred"].includes(
                            applicantMatch?.status
                        ) && (
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    updateApplicantMatch(
                                        "staged-assigned",
                                        position.hours_per_assignment || 0
                                    );
                                    setOpen(false);
                                }}
                            >
                                Assign to <b>{position.position_code}</b> (
                                {position.hours_per_assignment || 0})
                            </button>
                        )}
                    {applicantMatch?.status === "staged-assigned" && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                setShowChangeHours(true);
                                setOpen(false);
                            }}
                        >
                            Change assigned hours
                        </button>
                    )}
                    {applicantMatch?.status === "staged-assigned" && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                updateApplicantMatch("applied");
                                setOpen(false);
                            }}
                        >
                            Unassign from <b>{position.position_code}</b>
                        </button>
                    )}
                    {applicantMatch?.status !== "assigned" &&
                        applicantMatch?.status !== "hidden" && (
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    updateApplicantMatch("hidden");
                                    setOpen(false);
                                }}
                            >
                                Hide from <b>{position.position_code}</b>
                            </button>
                        )}
                    {applicantMatch?.status &&
                        ["hidden", "applied", "starred"].includes(
                            applicantMatch?.status
                        ) && (
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    hideApplicantFromAll();
                                    setOpen(false);
                                }}
                            >
                                Hide from all courses
                            </button>
                        )}
                    {applicantMatch?.status === "hidden" && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                updateApplicantMatch("applied");
                                setOpen(false);
                            }}
                        >
                            Unhide from <b>{position.position_code}</b>
                        </button>
                    )}
                </div>
            </Collapse>
            <Modal
                show={!!shownApplication}
                onHide={() => setShownApplication(null)}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Application Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {shownApplication && (
                        <ApplicationDetails application={shownApplication} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShownApplication(null)}
                        variant="outline-secondary"
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={showChangeHours}
                onHide={() => setShowChangeHours(false)}
                size="sm"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Update Hours</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="number"
                                defaultValue={
                                    applicantMatch &&
                                    applicantMatch.hoursAssigned > 0
                                        ? applicantMatch.hoursAssigned
                                        : 0
                                }
                                onChange={(e) =>
                                    setHoursAssigned(e.target.value)
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShowChangeHours(false)}
                        variant="outline-secondary"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            updateApplicantMatch(
                                "staged-assigned",
                                Number(hoursAssigned)
                            );
                            setShowChangeHours(false);
                        }}
                        variant="outline-primary"
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

/**
 * A button allowing one to toggle an applicant's "starred" status for the currently-sected position.
 *
 * @param {*} props
 * @returns
 */
function ApplicantStar({
    match,
    updateApplicantMatch,
    markAsUpdated,
}: {
    match: Match | null;
    updateApplicantMatch: Function;
    markAsUpdated: Function;
}) {
    async function _onClick() {
        if (match) {
            if (match.status === "applied" || match.status === "hidden") {
                updateApplicantMatch("starred");
            } else if (match.status === "starred") {
                updateApplicantMatch("applied");
            }
        }
    }

    return (
        <BsStarFill
            className={classNames("star-icon", {
                filled: match?.status === "starred",
            })}
            onClick={_onClick}
        />
    );
}

/**
 * A button that displays a dialog allowing one to edit an applicant's notes.
 * "markAsUpdated" is called when a change has been made.
 *
 * @param {*} props
 * @returns
 */
function ApplicantNote({
    applicantSummary,
    markAsUpdated,
}: {
    applicantSummary: ApplicantSummary;
    markAsUpdated: Function;
}) {
    const dispatch = useThunkDispatch();
    const [show, setShow] = React.useState(false);
    const [note, setNote] = React.useState(applicantSummary.note);

    function _onClick() {
        setShow(true);
    }

    function _upsertNote(utorid: string, note: string | null) {
        return dispatch(upsertNote({ utorid: utorid, note: note }));
    }

    async function updateApplicantNote(note: string | null) {
        await _upsertNote(applicantSummary.applicant.utorid, note);
        markAsUpdated(true);
    }

    return (
        <>
            <RiStickyNoteFill
                className={`applicant-icon ${
                    applicantSummary.note && applicantSummary.note.length > 0
                        ? "active"
                        : "inactive"
                }`}
                onClick={_onClick}
            />
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Applicant Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={applicantSummary.note || ""}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShow(false)}
                        variant="outline-secondary"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            if (note?.length === 0) {
                                updateApplicantNote(null);
                            } else {
                                updateApplicantNote(note);
                            }
                            setShow(false);
                        }}
                        variant="outline-primary"
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
