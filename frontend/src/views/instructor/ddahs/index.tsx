import React from "react";
import { FaEdit, FaUsers } from "react-icons/fa";
import { Duty } from "../../../api/defs/types";
import {
    ActionButton,
    ActionHeader,
    ActionsList,
} from "../../../components/action-buttons";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { ContentArea } from "../../../components/layout";
// import { ConnectedAddDdahDialog } from "../../admin/ddahs/add-ddah-dialog";

export function InstructorDDAHsView() {
    // const addDialogVisible = false;
    // const setAddDialogVisible = () => console.log("Sth");
    // const [s, setA] = React.useState(true);
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
        // TODO: either turn this into anonymous function or refactor into a select component
        // TODO: add a handler to value of select
        return (
            <select
                name="duties"
                id="duty-select"
                defaultValue={selectedOption}
            >
                <option value="">None</option>
                <option value="marking">Marking</option>
                <option value="contact">Contact</option>
                <option value="prep">Preparation</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
            </select>
        );
    }

    const activeEdit = true;
    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaEdit />}
                    onClick={() => console.log("edit")}
                    className={"nav-link" + activeEdit ? "active" : ""}
                >
                    Edit DDAH Template
                </ActionButton>
                <ActionButton
                    icon={<FaUsers />}
                    onClick={() => console.log("assign")}
                    className={"nav-link" + activeEdit ? "" : "active"}
                >
                    Assign tasks
                </ActionButton>
            </ActionsList>
            <ContentArea>
                <h2>{position.position_code} DDAH Template</h2>
                <AdvancedFilterTable
                    columns={[
                        {
                            Header: "Description",
                            accessor: (row: Duty) =>
                                row.description.substring(
                                    row.description.indexOf(":") + 1
                                ),
                            Footer: 'Add task'
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
                            Footer: (info: { rows: any[] }) => {
                                // Only calculate total hours if rows change
                                console.log(info);
                                const total = React.useMemo(
                                    () =>
                                        info.rows.reduce(
                                            (sum, row) =>
                                                row.values.hours + sum,
                                            0
                                        ),
                                    [info.rows]
                                );

                                return <>Total: {total}</>;
                            },
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
