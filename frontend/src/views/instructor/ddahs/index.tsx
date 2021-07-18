import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Duty } from "../../../api/defs/types";
import {
    ActionButton,
    ActionHeader,
    ActionsList,
} from "../../../components/action-buttons";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { ContentArea } from "../../../components/layout";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { ConnectedAddDdahDialog } from "../../admin/ddahs/add-ddah-dialog";

export function InstructorDDAHsView() {
    const activeSession = true;
    const [activeEdit, setActiveEdit] = useState(true);
    const selectedDdahs: any = [];
    const setImportInProgress = null;
    const addDialogVisible = false;
    const importInProgress = false;
    const setAddDialogVisible = () => console.log("Sth");
    const position = {
        id: 1661,
        position_code: "MAT136H1F",
        position_title: "Calculus II",
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 70,
        contract_template_id: 838,
        qualifications: null,
        duties: [
            {
                order: 1,
                hours: 20,
                description: "marking:Test Marking",
            },
            {
                order: 2,
                hours: 50,
                description: "other:Additional duties",
            },
        ],
        desired_num_assignments: null,
        current_enrollment: null,
        current_waitlisted: null,
        instructor_ids: [588, 587],
    };
    // TODO: aggregate duties for all DDAHs in a posting?
    const ddah = {
        id: 676,
        assignment_id: 1674,
        approved_date: null,
        accepted_date: null,
        revised_date: null,
        emailed_date: null,
        signature: null,
        url_token: "xuK5QL39HL27bgMrvYtyfep9",
        duties: [
            {
                order: 1,
                hours: 10,
                description: "other:Other stuff",
            },
            {
                order: 2,
                hours: 50,
                description: "meeting:Meet",
            },
            {
                order: 3,
                hours: 5,
                description: "prep:Prep",
            },
        ],
    };

    function OptionDropdown(selectedOption = "") {
        // TODO: refactor this neatly
        enum DUTY_VALUES {
            MARKING = "marking",
            CONTACT = "contact",
            PREP = "prep",
            MEETING = "meeting",
            TRAINING = "training",
            OTHER = "other",
        }

        return (
            <select name="duties" id="duty-select">
                <option value="">None</option>
                <option
                    value="marking"
                    selected={selectedOption == DUTY_VALUES.MARKING}
                >
                    Marking
                </option>
                <option
                    value="contact"
                    selected={selectedOption == DUTY_VALUES.CONTACT}
                >
                    Contact
                </option>
                <option
                    value="prep"
                    selected={selectedOption == DUTY_VALUES.PREP}
                >
                    Preparation
                </option>
                <option
                    value="meeting"
                    selected={selectedOption == DUTY_VALUES.MEETING}
                >
                    Meeting
                </option>
                <option
                    value="training"
                    selected={selectedOption == DUTY_VALUES.TRAINING}
                >
                    Training
                </option>
                <option
                    value="other"
                    selected={selectedOption == DUTY_VALUES.OTHER}
                >
                    Other
                </option>
            </select>
        );
    }

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaEdit />}
                    onClick={() => {
                        setActiveEdit(true);
                        console.log("Edit DDAH Template");
                    }}
                    disabled={!activeSession}
                    className={'nav-link' + activeEdit ? 'active' : ''}
                >
                    Edit DDAH Template
                </ActionButton>
                <ActionButton
                    onClick={() => {
                        setActiveEdit(false);
                        console.log(" Assign tasks");
                    }}
                    disabled={!activeSession}
                    className={'nav-link' + activeEdit ? '' : 'active'}
                >
                    Assign tasks
                </ActionButton>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify DDAHs, you must select a session." />
                )}
                <ConnectedAddDdahDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible();
                    }}
                />
                <h2>{position.position_code} DDAH Template</h2>
                <AdvancedFilterTable
                    columns={[
                        {
                            Header: "Description",
                            accessor: (row: Duty) =>
                                row.description.substring(
                                    row.description.indexOf(":") + 1
                                ),
                        },
                        {
                            Header: "Category",
                            accessor: (row: Duty) =>
                                OptionDropdown(
                                    row.description.substring(
                                        0,
                                        row.description.indexOf(":")
                                    )
                                ),
                        },
                        {
                            Header: "Hours",
                            accessor: "hours",
                        },
                    ]}
                    data={ddah.duties}
                />
                <div>
                    <button>Add task</button>
                </div>
            </ContentArea>
        </div>
    );
}
