import React from "react";
import classNames from "classnames";

import { Position, Application } from "../../../api/defs/types";
import { ApplicantSummary, Match } from "./types";

import { FaFilter, FaTable, FaTh, FaLock } from "react-icons/fa";
import { BsStarFill } from "react-icons/bs";
import { RiStickyNoteFill } from "react-icons/ri";

import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import Collapse from "react-bootstrap/Collapse";
import { Form, Table, Modal, Button } from "react-bootstrap";

import { sum } from "../../../api/mockAPI/utils";
import { round } from "../../../libs/utils";

import { upsertMatch, upsertNote } from "./actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

import {
    getApplicantMatchForPosition,
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "./utils";
import { SortDropdowns, applySorts } from "./sorts";
import { FilterModal, applyFilters, FilterListItem } from "./filters";

import { ApplicationDetails } from "../applications/application-details";

import "./styles.css";

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
    setMarkAsUpdated,
    setLocalStore,
}: {
    position: Position | null;
    applicants: ApplicantSummary[];
    setMarkAsUpdated: Function;
    setLocalStore: Function;
}) {
    const [viewType, setViewType] = React.useState<"table" | "grid">("grid");
    const [searchValue, setSearchValue] = React.useState("");
    const [sortList, setSortList] = React.useState<string[]>([
        "deptAsc",
        "programDesc",
        "yipAsc",
    ]);

    const [showFilters, setShowFilters] = React.useState(false);
    const [filterList, setFilterList] = React.useState<FilterListItem[]>([]);

    const filteredApplicants = React.useMemo(() => {
        if (!applicants) {
            return [] as ApplicantSummary[];
        }

        // Filter applicants that match the search value
        const filteredBySearch: ApplicantSummary[] =
            applicants.filter((applicant) =>
                `$(applicant.applicant.first_name) $(applicant.applicant.last_name) $(applicant.applicant.utorid)`
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
            ) || [];

        // Apply filters based on filter list
        const filteredByFilters: ApplicantSummary[] =
            applyFilters(filteredBySearch, filterList, position) || [];

        // Apply sorts based on sort lists
        applySorts(filteredByFilters, sortList, position);

        return filteredByFilters;
    }, [searchValue, sortList, filterList, applicants, position]);

    return (
        <div className="matching-course-main">
            <div className="matching-course-header">
                <div className="search-container">
                    <Form inline>
                        <Form.Control
                            type="text"
                            placeholder="Filter by name/UTORid..."
                            className="mr-sm-2"
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </Form>
                    <div className="filter-button-container">
                        <FaFilter
                            className={`filter-button ${
                                filterList.length > 0 ? "active" : ""
                            }`}
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
                            applicants={filteredApplicants}
                            setMarkAsUpdated={setMarkAsUpdated}
                            setLocalStore={setLocalStore}
                        />
                    ) : (
                        <GridView
                            position={position}
                            applicants={filteredApplicants}
                            setMarkAsUpdated={setMarkAsUpdated}
                            setLocalStore={setLocalStore}
                        />
                    ))}
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

function TableView({
    position,
    applicants,
    setMarkAsUpdated,
    setLocalStore,
}: {
    position: Position;
    applicants: ApplicantSummary[];
    setMarkAsUpdated: Function;
    setLocalStore: Function;
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
                {applicants.map((applicant) => {
                    return (
                        <TableRow
                            applicant={applicant}
                            position={position}
                            setMarkAsUpdated={setMarkAsUpdated}
                            setLocalStore={setLocalStore}
                            key={applicant.applicant.id}
                        />
                    );
                })}
            </tbody>
        </Table>
    );
}

function getMappedStatusForMatch(match: Match | null) {
    if (!match) {
        return null;
    }

    return Object.keys(statusMapping).find((key) =>
        statusMapping[key].includes(match.status)
    );
}

function TableRow({
    position,
    applicant,
    setMarkAsUpdated,
    setLocalStore,
}: {
    position: Position;
    applicant: ApplicantSummary;
    setMarkAsUpdated: Function;
    setLocalStore: Function;
}) {
    const applicantMatch = getApplicantMatchForPosition(applicant, position);
    const statusCategory = getMappedStatusForMatch(applicantMatch);
    const positionPref = getPositionPrefForPosition(
        applicant.application,
        position
    );

    const instructorRatings =
        applicant.application.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            }) || [];

    return (
        <tr>
            <td>
                {statusCategory}{" "}
                {statusCategory === "Assigned"
                    ? "(" +
                      (applicantMatch ? applicantMatch.hoursAssigned : 0) +
                      ")"
                    : ""}
            </td>
            <td>{applicant.applicant.last_name}</td>
            <td>{applicant.applicant.first_name}</td>
            <td>{applicant.applicant.utorid}</td>
            <td>{applicant.application.department}</td>
            <td>{applicant.application.program}</td>
            <td>{applicant.application.yip}</td>
            <td>
                {applicant.application.gpa ? applicant.application.gpa : ""}
            </td>
            <td>{positionPref ? positionPref.preference_level : ""}</td>
            <td>
                {instructorRatings.length > 0
                    ? round(
                          sum(...instructorRatings) / instructorRatings.length,
                          3
                      ) +
                      (instructorRatings.length > 1
                          ? " (" + instructorRatings.length + ")"
                          : "")
                    : ""}
            </td>
            <td>
                {applicant.matches.map((match) => {
                    if (
                        match.status === "assigned" ||
                        match.status === "staged-assigned"
                    ) {
                        return (
                            match.positionCode +
                            " (" +
                            match.hoursAssigned +
                            ") "
                        );
                    }
                    return "";
                })}
            </td>
            <td>{getApplicantTotalHoursAssigned(applicant)}</td>
            <td>
                {applicant.guarantee &&
                    applicant.guarantee.previousHoursFulfilled}
            </td>
            <td>{applicant.guarantee && applicant.guarantee.totalHoursOwed}</td>
        </tr>
    );
}

function GridView({
    position,
    applicants,
    setMarkAsUpdated,
    setLocalStore,
}: {
    position: Position;
    applicants: ApplicantSummary[];
    setMarkAsUpdated: Function;
    setLocalStore: Function;
}) {
    const applicantSummariesByMatchStatus: Record<string, ApplicantSummary[]> =
        {};
    Object.keys(statusMapping).map(
        (key) => (applicantSummariesByMatchStatus[key] = [])
    );

    for (const applicant of applicants) {
        const applicantMatch = getApplicantMatchForPosition(
            applicant,
            position
        );
        const statusCategory = getMappedStatusForMatch(applicantMatch);
        if (statusCategory) {
            applicantSummariesByMatchStatus[statusCategory].push(applicant);
        }
    }

    return (
        <div>
            {Object.keys(applicantSummariesByMatchStatus).map((key) => {
                return (
                    <GridSection
                        key={key}
                        header={key}
                        applicants={applicantSummariesByMatchStatus[key]}
                        setMarkAsUpdated={setMarkAsUpdated}
                        setLocalStore={setLocalStore}
                        position={position}
                    />
                );
            })}
        </div>
    );
}

function GridSection({
    header,
    applicants,
    position,
    setMarkAsUpdated,
    setLocalStore,
}: {
    header: string;
    applicants: ApplicantSummary[];
    position: Position;
    setMarkAsUpdated: Function;
    setLocalStore: Function;
}) {
    // Don't show the section if there are no applicants
    if (applicants.length === 0) {
        return null;
    }

    return (
        <div className="grid-view-section">
            <h4>{header}</h4>
            <div className="grid-view-list">
                {applicants.map((applicant) => {
                    return (
                        <GridItem
                            applicantSummary={applicant}
                            position={position}
                            setMarkAsUpdated={setMarkAsUpdated}
                            setLocalStore={setLocalStore}
                            key={applicant.applicant.id}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function GridItem({
    applicantSummary,
    position,
    setMarkAsUpdated,
    setLocalStore,
}: {
    applicantSummary: ApplicantSummary;
    position: Position;
    setMarkAsUpdated: Function;
    setLocalStore: Function;
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
                setMarkAsUpdated(true);
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
        setMarkAsUpdated(true);
    }

    let filledStatus: "empty" | "under" | "matched" | "over" | "" = "";
    const hoursOwed = applicantSummary.guarantee
        ? applicantSummary.guarantee.totalHoursOwed
        : 0;
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
        ) +
            (applicantSummary.guarantee
                ? applicantSummary.guarantee.previousHoursFulfilled
                : 0),
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
                            {applicantSummary.applicant.first_name +
                                " " +
                                applicantSummary.applicant.last_name}
                        </div>
                        <div
                            className="icon-container"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            {!applicantMatch?.status.includes("assigned") && (
                                <ApplicantStar
                                    match={applicantMatch}
                                    updateApplicantMatch={updateApplicantMatch}
                                    setLocalStore={setLocalStore}
                                    setMarkAsUpdated={setMarkAsUpdated}
                                />
                            )}
                            {applicantMatch?.status === "assigned" && (
                                <FaLock className="applicant-icon active" />
                            )}
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-detail-small">
                            {applicantSummary.application.department
                                ?.substring(0, 1)
                                .toUpperCase()}
                        </div>
                        <div className="grid-detail-small">
                            {applicantSummary.application.program?.substring(
                                0,
                                1
                            )}
                            {applicantSummary.application.yip}
                        </div>
                        <div className="grid-detail-small">
                            {positionPref ? positionPref.preference_level : ""}
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
                                setMarkAsUpdated={setMarkAsUpdated}
                                setLocalStore={setLocalStore}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Collapse in={open}>
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

function ApplicantStar({
    match,
    updateApplicantMatch,
    setMarkAsUpdated,
    setLocalStore,
}: {
    match: Match | null;
    updateApplicantMatch: Function;
    setMarkAsUpdated: Function;
    setLocalStore: Function;
}) {
    async function _onClick(e: any) {
        if (match) {
            if (match.status === "applied" || match.status === "hidden") {
                updateApplicantMatch("starred");
            } else if (match.status === "starred") {
                updateApplicantMatch("applied");
            }
        }
    }

    if (match && match.status === "starred") {
        return (
            <BsStarFill
                className="star-icon filled"
                onClick={async (e) => _onClick(e)}
            />
        );
    }

    return (
        <BsStarFill className="star-icon" onClick={async (e) => _onClick(e)} />
    );
}

function ApplicantNote({
    applicantSummary,
    setMarkAsUpdated,
    setLocalStore,
}: {
    applicantSummary: ApplicantSummary;
    setMarkAsUpdated: Function;
    setLocalStore: Function;
}) {
    const dispatch = useThunkDispatch();
    const [show, setShow] = React.useState(false);
    const [note, setNote] = React.useState(applicantSummary.note);

    function _onClick(e: any) {
        setShow(true);
    }

    function _upsertNote(utorid: string, note: string | null) {
        return dispatch(upsertNote({ utorid: utorid, note: note }));
    }

    async function updateApplicantNote(note: string | null) {
        await _upsertNote(applicantSummary.applicant.utorid, note);
        setMarkAsUpdated(true);
    }

    return (
        <>
            <RiStickyNoteFill
                className={`applicant-icon ${
                    applicantSummary.note && applicantSummary.note.length > 0
                        ? "active"
                        : "inactive"
                }`}
                onClick={(e) => _onClick(e)}
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
                                defaultValue={
                                    applicantSummary.note &&
                                    applicantSummary.note.length > 0
                                        ? applicantSummary.note
                                        : ""
                                }
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
