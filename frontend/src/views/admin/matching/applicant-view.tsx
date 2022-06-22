import React from "react";

import { Position, Applicant } from "../../../api/defs/types";
import { PositionSummary, ApplicantSummary } from "./types";

import { FaFilter, FaTable, FaTh } from "react-icons/fa";
import { Button, Form } from "react-bootstrap";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { Table } from "react-bootstrap";

import "./styles.css";

export function ApplicantView({
    summary,
}: {
    summary: PositionSummary | null;
}) {
    const [viewType, setViewType] = React.useState("table");
    const [searchValue, setSearchValue] = React.useState('');
    const [applicantFilters, setApplicantFilters] = React.useState([]);

    const filteredApplicants = React.useMemo(() => {
        const ret: ApplicantSummary[] | null = summary && summary.applicantSummaries
            .filter(
                (applicantSummary) => 
                    (
                        applicantSummary.applicant.first_name + 
                        " " + 
                        applicantSummary.applicant.last_name
                    ).toLowerCase().includes(searchValue.toLowerCase())
            )
            .sort((a, b) => {
                return (
                    (a.applicant.last_name + ", " + a.applicant.first_name).toLowerCase() <
                    (b.applicant.last_name + ", " + b.applicant.first_name).toLowerCase())
                        ? -1
                        : 1;
            });

        return ret;
    }, [searchValue, applicantFilters, summary]);

    return (
        <div className="matching-course-main">
            <div className="search-container">
                <Form inline>
                    <Form.Control type="text" placeholder="Search applicants..." className="mr-sm-2" onChange={
                        (e) => setSearchValue(e.target.value)
                    }/>
                </Form>
                <div className="filter-button-container">
                    <FaFilter className="filter-button" />
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
                        ? <TableView applicantSummaries={filteredApplicants} />
                        : <GridView applicantSummaries={filteredApplicants} />
                    )
                }
            </div>
        </div>
    );
}

function TableView({
    applicantSummaries
}: {
    applicantSummaries: ApplicantSummary[] | null
}) {
    const columns = [
        {
            Header: "Last",
            accessor: "last_name"
        },
        {
            Header: "First",
            accessor: "first_name"
        },
        {
            Header: "UTORid",
            accessor: "utorid"
        },
        {
            Header: "Program",
            accessor: "program"
        },
        {
            Header: "YIP",
            accessor: "yip"
        },
        {
            Header: "Department",
            accessor: "department"
        },
        // {
        //     Header: "Guaranteed",
        //     accessor: "guaranteed_hours"
        // },
        // {
        //     Header: "Assigned",
        //     accessor: "assigned_hours"
        // },
        // {
        //     Header: "Assignments",
        //     accessor: "assignments"
        // },
        // {
        //     Header: "Instr. Rating",
        //     accessor: "instructor_ratings"
        // },
        // {
        //     Header: "TA Rating",
        //     accessor: "preference_level"
        // },
        // {
        //     Header: "Status",
        //     accessor: "status"
        // }
    ];

    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
            <tr>
            {columns.map((item, i) => {
                return (
                    <th>{item.Header}</th>
                );
            })}
            </tr>
            </thead>
            <tbody>
            { applicantSummaries && applicantSummaries.map((summary) => {
                return (
                    <TableRow 
                        summary={summary} 
                        key={summary.applicant.id}
                    />
                );
            }) }
            </tbody>
        </Table>
    );
}

function TableRow({
    summary
}: {
    summary: ApplicantSummary
}) {
    return (
        <tr>
            <td>{summary.applicant.last_name}</td>
            <td>{summary.applicant.first_name}</td>
            <td>{summary.applicant.utorid}</td>
            <td>{summary.mostRecentApplication.program}</td>
            <td>{summary.mostRecentApplication.yip}</td>
            <td>{summary.mostRecentApplication.department}</td>
        </tr>
    );
}

function GridView({
    applicantSummaries
}: {
    applicantSummaries: ApplicantSummary[] | null
}) {
    return (
        <div>
        { applicantSummaries && applicantSummaries.map((summary) => {
            return (
                <GridItem
                    summary={summary}
                    key={summary.applicant.id}
                />
            )
        })}
        </div>
    );
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