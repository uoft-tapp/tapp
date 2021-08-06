import React from "react";
import { FaCheck } from "react-icons/fa";

import { Button, Modal, Spinner } from "react-bootstrap";
import { formatDate } from "../../../libs/utils";
import { ddahIssues, getReadableStatus } from "../../../libs/ddah-utils";

import "./style.css";
import { useSelector } from "react-redux";
import { ddahsSelector, emailDdah } from "../../../api/actions/ddahs";
import {
    activePositionSelector,
    ddahsForEmailSelector,
    setDdahForEmailIds,
} from "../store/actions";
import { generateHeaderCell } from "../../../components/table-utils";
import { IssuesCell } from "./ddahs-table";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export interface RowData {
    id?: number;
    position_code: string;
    last_name: string;
    first_name: string;
    total_hours: number | null;
    status: string | null;
    emailed_date: string | null;
    issues: string | null;
    issue_code: "hours_mismatch" | "missing" | null;
}

export function DdahEmailModal({
    show,
    onHide: _onHide = () => {},
}: {
    show: Boolean;
    onHide?: Function;
}): React.ReactElement {
    const [inProgress, setInProgress] = React.useState(false);
    const dispatch = useThunkDispatch();
    const ddahsForEmailIds = useSelector(ddahsForEmailSelector);
    const activePosition = useSelector(activePositionSelector);
    const allDdahs = useSelector(ddahsSelector);
    const ddahs = React.useMemo(
        () =>
            allDdahs.filter(
                (ddah) => ddah.assignment.position.id === activePosition?.id
            ),
        [allDdahs, activePosition]
    );
    const ddahsForEmail = React.useMemo(
        () => ddahs.filter((ddah) => ddahsForEmailIds.includes(ddah.id)),
        [ddahs, ddahsForEmailIds]
    );

    // The omni-search doesn't work on nested properties, so we need to flatten
    // the data we display before sending it to the table.
    const data = React.useMemo(
        () =>
            ddahs.map(
                (ddah) =>
                    ({
                        id: ddah.id,
                        assignment_id: ddah.assignment.id,
                        position_code: ddah.assignment.position.position_code,
                        last_name: ddah.assignment.applicant.last_name,
                        first_name: ddah.assignment.applicant.first_name,
                        total_hours: ddah.total_hours,
                        status: ddah.status || "unsent",
                        emailed_date: formatDate(ddah.emailed_date || ""),
                        approved: ddah.approved_date ? "Approved" : "",
                        readable_status: getReadableStatus(ddah),
                        issues: ddahIssues(ddah),
                        issue_code: ddahIssues(ddah) ? "hours_mismatch" : null,
                    } as RowData)
            ),
        [ddahs]
    );

    const columns = React.useMemo(
        () => [
            {
                Header: generateHeaderCell("Last Name"),
                accessor: "last_name",
            },
            {
                Header: generateHeaderCell("First Name"),
                accessor: "first_name",
            },
            {
                Header: generateHeaderCell("DDAH Hours"),
                accessor: "total_hours",
                maxWidth: 120,
                style: { textAlign: "right" },
            },
            {
                Header: generateHeaderCell("Status"),
                accessor: "status",
            },
            {
                Header: generateHeaderCell("Emailed"),
                accessor: "emailed_date",
            },
            {
                Header: generateHeaderCell("Approved"),
                accessor: "approved",
                Cell: ({ value }: any) =>
                    value ? (
                        <div className="accepted-ddah">
                            <FaCheck />
                        </div>
                    ) : null,
            },
            {
                Header: generateHeaderCell("Issues"),
                accessor: "issues",
                Cell: IssuesCell,
            },
        ],
        []
    );

    function onHide() {
        _onHide();
    }

    async function sendEmails() {
        try {
            setInProgress(true);
            await Promise.all(
                ddahsForEmail.map((ddah) => dispatch(emailDdah(ddah)))
            );
            onHide();
        } finally {
            setInProgress(false);
        }
    }

    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    return (
        <Modal show={show} onHide={onHide} dialogClassName="wide-modal">
            <Modal.Header closeButton>
                <Modal.Title>Email DDAH Forms to TA(s)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Select the DDAH forms you wish to email. (You may select all
                    DDAHs by clicking the header of the checkboxes column.) You
                    will be CCed on each email.
                </p>
                <AdvancedFilterTable
                    data={data}
                    columns={columns}
                    filterable={true}
                    selected={ddahsForEmailIds}
                    setSelected={(ids: number[]) =>
                        dispatch(setDdahForEmailIds(ids))
                    }
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    disabled={ddahsForEmail.length === 0 || !!spinner}
                    title={
                        ddahsForEmail.length === 0
                            ? "You must select at least one DDAH to email"
                            : "Email DDAH(s)"
                    }
                    onClick={sendEmails}
                >
                    {spinner}
                    Email {ddahsForEmail.length
                        ? ddahsForEmail.length
                        : ""}{" "}
                    DDAH
                    {ddahsForEmail.length === 1 ? "" : "s"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
