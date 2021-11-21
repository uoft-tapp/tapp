import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { applicationsSelector } from "../../../api/actions";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Assignment } from "../../../api/defs/types";
import { generateHeaderCell } from "../../../components/table-utils";
import { ApplicantRatingAndComment } from "../../../components/applicant-rating";

export function InstructorApplicationsTable() {
    const activePosition = useSelector(activePositionSelector);
    const allApplications = useSelector(applicationsSelector);

    const flatApplications = useMemo(() => {
        if (!activePosition) {
            return [];
        }
        const relevantApplications = allApplications.filter((application) =>
            application.position_preferences.some(
                (preference) => preference.position.id === activePosition.id
            )
        );
        console.log(relevantApplications);
        return relevantApplications;
    }, [activePosition, allApplications]);

    if (!activePosition) {
        return <h4>No position currently selected</h4>;
    }

    const columns = [
        {
            Header: "Your Rating",

            id: "instructor_preference",
            Cell: ApplicantRatingAndComment,
        },
        {
            Header: "Application",
            accessor: "applicant.utorid",
        },
        {
            Header: "Last Name",
            accessor: "applicant.last_name",
        },
        {
            Header: "First Name",
            accessor: "applicant.first_name",
        },
        {
            Header: "Email",
            accessor: "applicant.email",
            Cell: ({
                value,
                row,
            }: {
                value: string;
                row: { original: Assignment };
            }) => {
                const assignment = row.original;
                const applicant = assignment.applicant;
                return (
                    <a
                        href={encodeURI(
                            `mailto:${applicant.first_name} ${applicant.last_name} <${value}>?subject=${activePosition.position_code}&body=Dear ${applicant.first_name} ${applicant.last_name},\n\n`
                        )}
                    >
                        {value}
                    </a>
                );
            },
        },
        {
            Header: generateHeaderCell(
                "Program",
                "Program: P (PhD), M (Masters), U (Undergrad)"
            ),
            width: 90,
            accessor: "program",
        },
        {
            Header: generateHeaderCell("YIP", "Year of study"),
            width: 50,
            accessor: "yip",
        },
        {
            Header: generateHeaderCell("GPA"),
            width: 60,
            accessor: "gpa",
        },
        {
            Header: generateHeaderCell("Experience"),
            accessor: "previous_experience_summary",
        },
    ];

    return (
        <AdvancedFilterTable
            filterable={true}
            columns={columns}
            data={flatApplications}
        />
    );
}
