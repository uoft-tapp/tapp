import React from "react";

import { Position, Applicant, Application } from "../../../api/defs/types";
import { PositionSummary, ApplicantSummary, Match } from "./types";
import { positionsSelector } from "../../../api/actions";

import { FaFilter, FaTable, FaTh } from "react-icons/fa";
import { Button, Form } from "react-bootstrap";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { Table } from "react-bootstrap";

import { sum } from "../../../api/mockAPI/utils";
import { round } from "../../../libs/utils";

import "./styles.css";

const statusMapping: Record<string, string[]> = {
    "Assigned": ["staged-assigned", "assigned"],
    "Starred": ["starred"],
    "Applied": ["applied"],
    "Hidden": ["hidden"]
}

function GetApplicantMatchForPosition(applicantSummary: ApplicantSummary, position: Position) {
    return applicantSummary.matches.find((match) => match.positionId === position.id) || null;
}

function GetPositionPrefForPosition(application: Application, position: Position) {
    return application.position_preferences?.find((positionPref) => positionPref.position.id === position.id);
}

export function ApplicantView({
    summary,
}: {
    summary: PositionSummary | null;
}) {
    const [viewType, setViewType] = React.useState("table");
    const [searchValue, setSearchValue] = React.useState('');
    const [applicantFilters, setApplicantFilters] = React.useState({
        program: [
            {code: "P", value: true },
            {code: "M", value: true},
            {code: "U", value: true}
        ]
    });

    const programFilters = applicantFilters.program.filter((item) => item.value).map((item) => { return item.code })

    const filteredApplicants = summary && summary.applicantSummaries
        .filter(
            (applicantSummary) => 
                (applicantSummary.applicant.first_name + 
                    " " + 
                    applicantSummary.applicant.last_name + 
                    " " + 
                    applicantSummary.applicant.utorid
                ).toLowerCase().includes(searchValue.toLowerCase())
                && programFilters.includes(applicantSummary.mostRecentApplication?.program || "")
        )
        .sort((a, b) => {
            return (
                (a.applicant.last_name + ", " + a.applicant.first_name).toLowerCase() <
                (b.applicant.last_name + ", " + b.applicant.first_name).toLowerCase())
                    ? -1
                    : 1;
        });

    return (
        <div className="matching-course-main">
            <div className="search-container">
                <Form inline>
                    <Form.Control type="text" placeholder="Search applicants..." className="mr-sm-2" onChange={
                        (e) => setSearchValue(e.target.value)
                    }/>
                </Form>
                <div className="filter-button-container">
                    <FaFilter className="filter-button" onClick={
                        (e) => {
                            const updatedFilter = [...applicantFilters.program];
                            const target = updatedFilter.find((item) => item.code === "U");
                            if (target) {
                                target.value = !target.value;
                            }

                            // TODO: update this; it currently just toggles "U"
                            setApplicantFilters({...applicantFilters, 
                                program: updatedFilter
                            });
                        }
                    }/>
                </div>
                <div className="container-filler"></div>
                <ToggleButtonGroup id="view-toggle" type="radio" name="views" defaultValue={viewType} onChange={setViewType}>
                    <ToggleButton id="tbg-radio-1" value={"grid"}>
                        <FaTh/>
                    </ToggleButton>
                    <ToggleButton id="tbg-radio-2" value={"table"}>
                        <FaTable/>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div>
                <h2>{ summary && summary.position.position_code }</h2>
                { summary && (
                    viewType === "table" 
                        ? <TableView 
                            positionSummary={summary}
                            applicantSummaries={filteredApplicants} />
                        : <GridView 
                            positionSummary={summary}
                            applicantSummaries={filteredApplicants} />
                    )
                }
            </div>
        </div>
    );
}

function TableView({
    positionSummary,
    applicantSummaries
}: {
    positionSummary: PositionSummary | null;
    applicantSummaries: ApplicantSummary[] | null;
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
            { applicantSummaries && positionSummary && applicantSummaries.map((summary) => {
                return (
                    <TableRow 
                        summary={summary}
                        position={positionSummary.position}
                        key={summary.applicant.id}
                    />
                );
            }) }
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
    summary,
    position
}: {
    summary: ApplicantSummary;
    position: Position;
}) {
    const applicantMatch = GetApplicantMatchForPosition(summary, position);
    const statusCategory = GetMappedStatusForMatch(applicantMatch);
    const positionPref = GetPositionPrefForPosition(summary.mostRecentApplication, position);

    const instructorRatings = summary.mostRecentApplication.instructor_preferences.filter(
        (pref) => pref.position.id === position.id)
        .map((rating) => {
        return rating.preference_level
    }) || [];

    return (
        <tr>
            <td>{summary.applicant.last_name}</td>
            <td>{summary.applicant.first_name}</td>
            <td>{summary.applicant.utorid}</td>
            <td>{summary.mostRecentApplication.department}</td>
            <td>{summary.mostRecentApplication.program}</td>
            <td>{summary.mostRecentApplication.yip}</td>
            <td>{summary.mostRecentApplication.gpa && summary.mostRecentApplication.gpa}</td>
            <td>{statusCategory} { statusCategory === "Assigned" 
                ? "(" + (applicantMatch ? applicantMatch.hoursAssigned : 0) + ")" 
                : "" }</td>
            <td>{ positionPref ? positionPref.preference_level : "" }</td>
            <td>{ instructorRatings.length > 0 ? round(sum(...instructorRatings) / instructorRatings.length, 3) + " (" + instructorRatings.length + ")" : "" }</td>
            <td>{ summary.matches.map((match) => {
                if (match.status === "assigned" || match.status === "staged-assigned") {
                    return match.positionCode + " (" + match.hoursAssigned + ") ";
                }
            }) }</td>

            <td>{ sum(...summary.matches.map((match) => {
                if (match.status === "assigned" || match.status === "staged-assigned") {
                    return match.hoursAssigned;
                }
                return 0;
            }))}</td>
            <td>{ summary.guarantee && summary.guarantee.previousHoursFulfilled}</td>
            <td>{ summary.guarantee && summary.guarantee.totalHoursOwed }</td>
        </tr>
    );
}

function GridView({
    positionSummary,
    applicantSummaries
}: {
    positionSummary: PositionSummary | null;
    applicantSummaries: ApplicantSummary[] | null;
}) {
    const applicantSummariesByMatchStatus: Record<string, ApplicantSummary[]> = {};
    Object.keys(statusMapping).map((key) => applicantSummariesByMatchStatus[key] = []);

    if (applicantSummaries && positionSummary) {
        for (const applicantSummary of applicantSummaries) {
            const applicantMatch = GetApplicantMatchForPosition(applicantSummary, positionSummary.position);
            const statusCategory = GetMappedStatusForMatch(applicantMatch);
            if (statusCategory) {
                applicantSummariesByMatchStatus[statusCategory].push(applicantSummary);
            }
        }
    }

    return (
        <div>
        { applicantSummaries && Object.keys(applicantSummariesByMatchStatus).map((key) => {
            return (
                <GridSection
                    header={key}
                    applicantSummaries={applicantSummariesByMatchStatus[key]}
                />
            )
        })}
        </div>
    );
}

function GridSection({
    header,
    applicantSummaries
}: {
    header: string,
    applicantSummaries: ApplicantSummary[]
}) {
    return (
        <div className="grid-view-section">
            <h4>{ header }</h4>
            <div className="grid-view-list">
                { applicantSummaries.map((summary) => {
                    return (
                        <GridItem
                            summary={summary}
                            key={summary.applicant.id}
                        />
                    )
                })}
            </div>
        </div>
    )
}

function GridItem({
    summary
}: {
    summary: ApplicantSummary
}) {
    return (
        <div className="applicant-grid-item">
            <div className="status-sidebar">
                <div>0</div>
                <div>0</div>
            </div>
            <div className="grid-header">
                <div className="applicant-name">{ summary.applicant.first_name + " " + summary.applicant.last_name }</div>
                <div className="tooltip-icon"></div>
                <div className="star-icon"></div>
            </div>
            <div className="grid-footer">
                <div className="department">{ summary.mostRecentApplication.department?.substring(0, 1).toUpperCase() }</div>
                <div className="program">{summary.mostRecentApplication.program?.substring(0, 1)}{summary.mostRecentApplication.yip}</div>
                <div className="ta-rating"></div>
                <div className="instructor-rating"></div>
            </div>
        </div>
    );
}