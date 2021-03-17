import React from "react";
import { ConnectedAddDdahDialog } from "./add-ddah-dialog";
import { FaPlus, FaMailBulk, FaCheck, FaTrash } from "react-icons/fa";
import {
    ConnectedImportDdahsAction,
    ConnectedExportDdahsAction,
    ConnectedDownloadPositionDdahTemplatesAction,
    ConnectedDownloadDdahsAcceptedListAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import {
    ConnectedDdahEditorModal,
    ConnectedDdahsTable,
    DdahPreviewModal,
    getReadableStatus,
    PreviewCell,
    StatusCell,
} from "../ddah-table";
import { MissingActiveSessionWarning } from "../../components/sessions";
import { useSelector, useDispatch } from "react-redux";
import { activeSessionSelector } from "../../api/actions";
import { ddahTableSelector } from "../ddah-table/actions";
import {
    ddahsSelector,
    emailDdah,
    approveDdah,
    deleteDdah,
} from "../../api/actions/ddahs";
import { Ddah } from "../../api/defs/types";
import { Button, Modal } from "react-bootstrap";
import { AdvancedFilterTable } from "../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../components/table-utils";

export interface ConfirmationDdahRowData {
    id?: number;
    position_code: string;
    last_name: string;
    first_name: string;
    total_hours: number | null;
    status: string | null;
}

export function AdminDdahsView(): React.ReactNode {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [importInProgress, setImportInProgress] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    const { selectedDdahIds } = useSelector(ddahTableSelector);
    const ddahs = useSelector<any, Ddah[]>(ddahsSelector);
    const dispatch = useDispatch();
    const selectedDdahs = ddahs.filter((ddah) =>
        selectedDdahIds.includes(ddah.id)
    );

    const [
        ddahDeletionConfirmationVisible,
        setDdahDeletionConfirmationVisible,
    ] = React.useState(false);

    function confirmDDAHDeletion() {
        if (selectedDdahs?.length > 1) {
            console.log(selectedDdahs);
            setDdahDeletionConfirmationVisible(true);
        } else {
            deleteDDAHs();
        }
    }

    function deleteDDAHs() {
        for (const ddah of selectedDdahs) {
            dispatch(deleteDdah(ddah));
        }

        setDdahDeletionConfirmationVisible(false);
    }

    function MultiWithdrawDdahConfirmationTable() {
        const dispatch = useDispatch();

        const [previewVisible, setPreviewVisible] = React.useState<Boolean>(
            false
        );
        const [editVisible, setEditVisible] = React.useState<Boolean>(false);
        const [previewDdah, setPreviewDdah] = React.useState<Ddah | null>(null);

        function onPreviewClick(id: number) {
            setPreviewDdah(ddahs.find((ddah) => ddah.id === id) || null);
            setPreviewVisible(true);
        }

        function WrappedStatusCell(props: any): React.ReactNode {
            const { row, ...rest } = props;
            return (
                <StatusCell row={row} {...rest}>
                    <PreviewCell {...props} onClick={onPreviewClick} />
                </StatusCell>
            );
        }

        function compareString(str1: string | number, str2: string | number) {
            if (str1 > str2) {
                return 1;
            } else if (str1 < str2) {
                return -1;
            }
            return 0;
        }

        // The omni-search doesn't work on nested properties, so we need to flatten
        // the data we display before sending it to the table.
        const data = selectedDdahs.map(
            (ddah) =>
                ({
                    id: ddah.id,
                    position_code: ddah.assignment.position.position_code,
                    last_name: ddah.assignment.applicant.last_name,
                    first_name: ddah.assignment.applicant.first_name,
                    total_hours: ddah.total_hours,
                    status: getReadableStatus(ddah),
                } as ConfirmationDdahRowData)
        );

        // Sort the table by position_code by default
        data.sort((d1, d2) => {
            return (
                compareString(d1.position_code, d2.position_code) ||
                compareString(d1.last_name, d2.last_name) ||
                compareString(d1.first_name, d2.first_name)
            );
        });

        const columns = [
            {
                Header: generateHeaderCell("Position"),
                accessor: "position_code",
            },
            { Header: generateHeaderCell("Last Name"), accessor: "last_name" },
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
                Cell: WrappedStatusCell,
            },
        ];

        return (
            <React.Fragment>
                <ConnectedDdahEditorModal
                    ddah={previewDdah}
                    show={editVisible}
                    onHide={() => setEditVisible(false)}
                />
                <DdahPreviewModal
                    ddah={previewDdah}
                    show={previewVisible}
                    onHide={() => setPreviewVisible(false)}
                    onEdit={() => {
                        setPreviewVisible(false);
                        setEditVisible(true);
                    }}
                    onApprove={async () => {
                        if (previewDdah) {
                            await dispatch(approveDdah(previewDdah));
                        }
                        setPreviewVisible(false);
                    }}
                />
                <AdvancedFilterTable
                    // The ReactTable types are not smart enough to know that you can use a function
                    // for Header, so we will opt out of the type system here.
                    columns={columns as any}
                    data={data}
                    filterable={true}
                />
            </React.Fragment>
        );
    }

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaPlus />}
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                    disabled={!activeSession}
                >
                    Add DDAH
                </ActionButton>
                <ConnectedDownloadPositionDdahTemplatesAction
                    disabled={!activeSession}
                />
                <ConnectedDownloadDdahsAcceptedListAction
                    disabled={!activeSession}
                />

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportDdahsAction
                    disabled={!activeSession}
                    setImportInProgress={setImportInProgress}
                />
                <ConnectedExportDdahsAction disabled={!activeSession} />
                <ActionHeader>Selected DDAH Actions</ActionHeader>
                <ActionButton
                    icon={FaMailBulk}
                    onClick={() => {
                        for (const ddah of selectedDdahs) {
                            dispatch(emailDdah(ddah));
                        }
                    }}
                    disabled={selectedDdahIds.length === 0}
                >
                    Email DDAH
                </ActionButton>
                <ActionButton
                    icon={FaCheck}
                    onClick={() => {
                        for (const ddah of selectedDdahs) {
                            dispatch(approveDdah(ddah));
                        }
                    }}
                    disabled={selectedDdahIds.length === 0}
                >
                    Approve DDAH
                </ActionButton>
                <ActionButton
                    icon={FaTrash}
                    onClick={confirmDDAHDeletion}
                    disabled={selectedDdahIds.length === 0}
                >
                    Delete DDAH
                </ActionButton>
                <Modal
                    show={ddahDeletionConfirmationVisible}
                    onHide={() => {
                        setDdahDeletionConfirmationVisible(false);
                    }}
                    size={"lg"}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Deleting Multiple DDAHs</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            You are deleting all of the following{" "}
                            {selectedDdahs?.length} DDAHs!
                        </div>
                        <div className="mb-3">
                            <MultiWithdrawDdahConfirmationTable />
                        </div>
                        Are you sure?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            onClick={() => {
                                setDdahDeletionConfirmationVisible(false);
                            }}
                            variant="light"
                        >
                            Cancel
                        </Button>
                        <Button onClick={deleteDDAHs}>Delete All</Button>
                    </Modal.Footer>
                </Modal>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify DDAHs, you must select a session." />
                )}
                <ConnectedAddDdahDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                {!importInProgress && <ConnectedDdahsTable />}
            </ContentArea>
        </div>
    );
}
