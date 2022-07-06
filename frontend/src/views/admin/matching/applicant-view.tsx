import React from "react";
import classNames from "classnames";

import { Position, Application } from "../../../api/defs/types";
import { ApplicantSummary, Match } from "./types";

import { FaFilter, FaTable, FaTh } from "react-icons/fa";
import { BsInfoCircleFill, BsStar } from "react-icons/bs";
import { RiStickyNoteFill } from "react-icons/ri";

import { Form } from "react-bootstrap";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { Table } from "react-bootstrap";

import { sum } from "../../../api/mockAPI/utils";
import { round } from "../../../libs/utils";

import { upsertMatch } from "./actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

import "./styles.css";

const statusMapping: Record<string, string[]> = {
    Assigned: ["staged-assigned", "assigned"],
    Starred: ["starred"],
    Applied: ["applied"],
    Hidden: ["hidden"],
};

function GetApplicantMatchForPosition(
    applicantSummary: ApplicantSummary,
    position: Position
) {
    return (
        applicantSummary.matches.find(
            (match) => match.positionId === position.id
        ) || null
    );
}

function GetPositionPrefForPosition(
    application: Application,
    position: Position
) {
    return application.position_preferences?.find(
        (positionPref) => positionPref.position.id === position.id
    );
}

export function ApplicantView({
    position,
    applicants,
    setMarkAsUpdated,
}: {
    position: Position | null;
    applicants: ApplicantSummary[];
    setMarkAsUpdated: Function;
}) {
    const [viewType, setViewType] = React.useState<"table" | "grid">("grid");
    const [searchValue, setSearchValue] = React.useState("");
    const [applicantFilters, setApplicantFilters] = React.useState({
        program: [
            { code: "P", value: true },
            { code: "M", value: true },
            { code: "U", value: true },
            { code: "MScAC", value: true },
            { code: "PD", value: true },
            { code: "other", value: true },
        ],
    });

    const programFilters = applicantFilters.program
        .filter((item) => item.value)
        .map((item) => {
            return item.code;
        });
    const filteredApplicants = React.useMemo(() => {
        const ret: ApplicantSummary[] = applicants
            .filter(
                (applicant) =>
                    (
                        applicant.applicant.first_name +
                        " " +
                        applicant.applicant.last_name +
                        " " +
                        applicant.applicant.utorid
                    )
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) &&
                    programFilters.includes(
                        applicant.mostRecentApplication?.program || ""
                    )
            )
            .sort((a, b) => {
                return (
                    a.applicant.last_name +
                    ", " +
                    a.applicant.first_name
                ).toLowerCase() <
                    (
                        b.applicant.last_name +
                        ", " +
                        b.applicant.first_name
                    ).toLowerCase()
                    ? -1
                    : 1;
            });
        return ret;
    }, [searchValue, applicants, programFilters]);

    return (
        <div className="matching-course-main">
            <div className="matching-course-header">
                <div className="search-container">
                    <Form inline>
                        <Form.Control
                            type="text"
                            placeholder="Search applicants..."
                            className="mr-sm-2"
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </Form>
                    <div className="filter-button-container">
                        <FaFilter
                            className="filter-button"
                            onClick={(e) => {
                                // TODO: update this; it currently just toggles "U"
                                const updatedFilter = [
                                    ...applicantFilters.program,
                                ];
                                const target = updatedFilter.find(
                                    (item) => item.code === "U"
                                );
                                if (target) {
                                    target.value = !target.value;
                                }

                                setApplicantFilters({
                                    ...applicantFilters,
                                    program: updatedFilter,
                                });
                            }}
                        />
                    </div>
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
                <div className="applicant-filter-container">
                    {/* TODO: collapsible div? filters go here */}
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
                        />
                    ) : (
                        <GridView
                            position={position}
                            applicants={filteredApplicants}
                            setMarkAsUpdated={setMarkAsUpdated}
                        />
                    ))}
            </div>
        </div>
    );
}

function TableView({
    position,
    applicants,
    setMarkAsUpdated,
}: {
    position: Position;
    applicants: ApplicantSummary[];
    setMarkAsUpdated: Function;
}) {
    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
                <tr>
                    <th>Last</th>
                    <th>First</th>
                    <th>UTORid</th>
                    <th>Department</th>
                    <th>Program</th>
                    <th>YIP</th>
                    <th>GPA</th>
                    <th>Status</th>
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
                            key={applicant.applicant.id}
                        />
                    );
                })}
            </tbody>
        </Table>
    );
}

function GetMappedStatusForMatch(match: Match | null) {
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
}: {
    position: Position;
    applicant: ApplicantSummary;
    setMarkAsUpdated: Function;
}) {
    const applicantMatch = GetApplicantMatchForPosition(applicant, position);
    const statusCategory = GetMappedStatusForMatch(applicantMatch);
    const positionPref = GetPositionPrefForPosition(
        applicant.mostRecentApplication,
        position
    );

    const instructorRatings =
        applicant.mostRecentApplication.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            }) || [];

    return (
        <tr>
            <td>{applicant.applicant.last_name}</td>
            <td>{applicant.applicant.first_name}</td>
            <td>{applicant.applicant.utorid}</td>
            <td>{applicant.mostRecentApplication.department}</td>
            <td>{applicant.mostRecentApplication.program}</td>
            <td>{applicant.mostRecentApplication.yip}</td>
            <td>
                {applicant.mostRecentApplication.gpa &&
                    applicant.mostRecentApplication.gpa}
            </td>
            <td>
                {statusCategory}{" "}
                {statusCategory === "Assigned"
                    ? "(" +
                      (applicantMatch ? applicantMatch.hoursAssigned : 0) +
                      ")"
                    : ""}
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

            <td>
                {sum(
                    ...applicant.matches.map((match) => {
                        if (
                            match.status === "assigned" ||
                            match.status === "staged-assigned"
                        ) {
                            return match.hoursAssigned;
                        }
                        return 0;
                    })
                )}
            </td>
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
}: {
    position: Position;
    applicants: ApplicantSummary[];
    setMarkAsUpdated: Function;
}) {
    const applicantSummariesByMatchStatus: Record<string, ApplicantSummary[]> =
        {};
    Object.keys(statusMapping).map(
        (key) => (applicantSummariesByMatchStatus[key] = [])
    );

    for (const applicant of applicants) {
        const applicantMatch = GetApplicantMatchForPosition(
            applicant,
            position
        );
        const statusCategory = GetMappedStatusForMatch(applicantMatch);
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
}: {
    header: string;
    applicants: ApplicantSummary[];
    position: Position;
    setMarkAsUpdated: Function;
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
                            applicant={applicant}
                            position={position}
                            setMarkAsUpdated={setMarkAsUpdated}
                            key={applicant.applicant.id}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function GridItem({
    applicant,
    position,
    setMarkAsUpdated,
}: {
    applicant: ApplicantSummary;
    position: Position;
    setMarkAsUpdated: Function;
}) {
    const dispatch = useThunkDispatch();

    function _upsertMatch(match: Match | null) {
        if (!match) {
            return;
        }
        return dispatch(upsertMatch(match));
    }

    async function updateMatch() {
        await _upsertMatch(newMatch);

        // Check if data has changed:
        setMarkAsUpdated(true);
    }

    const applicantMatch = GetApplicantMatchForPosition(applicant, position);
    const positionPref = GetPositionPrefForPosition(
        applicant.mostRecentApplication,
        position
    );

    const instructorRatings =
        applicant.mostRecentApplication.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            }) || [];

    // Purely for testing match update functionality
    const newMatch: Match | null = applicantMatch
        ? {
              applicantId: applicantMatch.applicantId,
              utorid: applicantMatch.utorid,
              positionId: applicantMatch.positionId,
              positionCode: applicantMatch.positionCode,
              status: "staged-assigned",
              hoursAssigned: 60,
          }
        : null;

    let filledStatus: "empty" | "under" | "matched" | "over" | "" = "";
    const hoursOwed = applicant.guarantee
        ? applicant.guarantee.totalHoursOwed
        : 0;
    const totalAssignedHours = round(
        sum(
            ...applicant.matches.map((match) => {
                if (
                    match.status === "assigned" ||
                    match.status === "staged-assigned"
                ) {
                    return match.hoursAssigned;
                }
                return 0;
            })
        ),
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
        <div className="applicant-grid-item noselect" onClick={updateMatch}>
            <div
                className={classNames("applicant-status-sidebar", filledStatus)}
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
                        {applicant.applicant.first_name +
                            " " +
                            applicant.applicant.last_name}
                    </div>
                    <div className="icon-container">
                        <ApplicantTooltip />
                        <ApplicantStar />
                    </div>
                </div>
                <div className="grid-row">
                    <div className="grid-detail-small">
                        {applicant.mostRecentApplication.department
                            ?.substring(0, 1)
                            .toUpperCase()}
                    </div>
                    <div className="grid-detail-small">
                        {applicant.mostRecentApplication.program?.substring(
                            0,
                            1
                        )}
                        {applicant.mostRecentApplication.yip}
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
                    <div className="icon-container">
                        <ApplicantNote />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ApplicantStar() {
    return <BsStar />;
}

function ApplicantTooltip() {
    return <BsInfoCircleFill />;
}

function ApplicantNote() {
    return <RiStickyNoteFill color="#eee" />;
}
