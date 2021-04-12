import { Button, Modal } from "react-bootstrap";
import React from "react";
import { ddahIssues, getReadableStatus } from "../ddah-table";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Ddah } from "../../../api/defs/types";
import { compareDDAH } from "../../../libs/compare-table-rows";
import { generateHeaderCell } from "../../../components/table-utils";

const ddahModalColumn = [
    {
        Header: generateHeaderCell("Position"),
        accessor: "position_code",
        width: 200,
    },
    {
        Header: generateHeaderCell("Last Name"),
        accessor: "last_name",
        maxWidth: 120,
    },
    {
        Header: generateHeaderCell("First Name"),
        accessor: "first_name",
        maxWidth: 120,
    },
    {
        Header: generateHeaderCell("Status"),
        accessor: "status",
        maxWidth: 100,
    },
    {
        Header: generateHeaderCell("Issues"),
        accessor: "issue",
        width: 250,
    },
];

export interface ConfirmationDdahRowData {
    id?: number;
    position_code: string;
    last_name: string;
    first_name: string;
    total_hours: number | null;
    status: string;
    issue: string;
}

export function MultiManipulateDdahConfirmation(props: {
    selectedDdahs: Ddah[];
    visible: boolean;
    setVisible: (visible: boolean) => void;
    manipulateDDAHs: () => void;
    titleMsg: String;
    alertMsg: String;
    confirmBtnMsg: String;
}) {
    const {
        selectedDdahs,
        visible,
        setVisible,
        manipulateDDAHs,
        titleMsg,
        alertMsg,
        confirmBtnMsg,
    } = props;

    // The omni-search doesn't work on nested properties, so we need to flatten
    // the data we display before sending it to the table.
    const data = selectedDdahs.map((ddah: Ddah) => {
        let ddahIssue = ddahIssues(ddah);
        if (!ddahIssue) {
            ddahIssue = "Missing DDAH";
        }
        return {
            id: ddah.id,
            position_code: ddah.assignment.position.position_code,
            last_name: ddah.assignment.applicant.last_name,
            first_name: ddah.assignment.applicant.first_name,
            total_hours: ddah.total_hours,
            status: getReadableStatus(ddah),
            issue: ddahIssue,
        } as ConfirmationDdahRowData;
    });

    // Sort the table by position_code by default
    data.sort(compareDDAH);

    return (
        <Modal
            show={visible}
            onHide={() => {
                setVisible(false);
            }}
            size={"lg"}
        >
            <Modal.Header closeButton>
                <Modal.Title>{titleMsg}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 alert alert-info" role="alert">
                    {alertMsg}
                </div>
                <div className="mb-3">
                    <AdvancedFilterTable
                        // The ReactTable types are not smart enough to know that you can use a function
                        // for Header, so we will opt out of the type system here.
                        columns={ddahModalColumn as any}
                        data={data}
                        filterable={false}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => {
                        setVisible(false);
                    }}
                    variant="light"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        manipulateDDAHs();
                        setVisible(false);
                    }}
                >
                    {confirmBtnMsg}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
