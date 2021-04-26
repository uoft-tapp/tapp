const contract_templates_by_filename = {
    "/math/default.html": `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Offer Letter</title>
        <style>
            * {
                box-sizing: border-box;
            }
            html {
                margin: 0;
                padding: 0;
            }
            body {
                width: 8.5in;
                margin: 0;
                padding-left: 0.75in;
                padding-right: 0.75in;
                hyphens: auto;
                text-align: justify;
                box-sizing: border-box;
                font-family: Helvetica, sans-serif;
                font-size: 12pt;
            }
            .i {
                font-style: italic;
            }
            .emphcolor {
                color: red;
            }
            table.appointment-summary {
                margin-left: 1in;
                font-size: 0.9em;
            }
            .appointment-summary th {
                padding-right: 0.5em;
                text-align: right;
                font-weight: normal;
            }
            .letter-head p {
                margin-bottom: 0.5in;
            }
            .letter-foot {
                margin-top: 1in;
            }
            .signature {
                font-family: alex_brushregular, cursive;
                font-size: 30pt;
                margin-left: 0.5in;
                margin-bottom: 0.1in;
            }
            .applicant .signature {
                border-bottom: 1px solid black;
                min-width: 2.5in;
                display: inline-block;
                margin-left: 0;
            }
            .checkbox {
                font-size: 18pt;
            }

            @media only screen and (max-width: 9in) {
                /* when printed, these styles won't show
				because the "screen" is 8.5in */
                body {
                    width: unset;
                    padding-bottom: 0.5in;
                    padding-left: 2em;
                    padding-right: 2em;
                }
            }
        </style>
        <link rel="stylesheet" href="font.css" />
        <link rel="stylesheet" href="header.css" />
        <!-- for rendering with wkhtmltopdf styles need to be inlined; when rendered directly in a browser,
	this will just be invalid CSS -->
        <style>
            {{ style_font }}
        </style>
        <style>
            {{ style_header }}
        </style>
    </head>
    <body>
        <div class="letter-head">
            <div class="uoftlogo"></div>
            <p>{{ date }}</p>
            <p>
                {{ first_name }} {{ last_name }}<br />
                c/o Some Department<br />
                University of Toronto
            </p>
            <p>Dear {{ first_name }},</p>
        </div>
        <div class="letter-body">
            <p>
                I am pleased to offer you an appointment as a Teaching Assistant
                in Some Department. The starting date of your appointment will
                be {{ start_date | date: "%b %d, %Y" }} and this appointment
                will end on {{ end_date | date: "%b %d, %Y" }} with no further
                notice to you.
            </p>
            <h3 class="i">Appointment Summary</h3>
            <table class="appointment-summary">
                <tr>
                    <th>Appointment:</th>
                    <td class="emphcolor">
                        {{ position_code }} {{ position_title }}
                    </td>
                </tr>
                <tr>
                    <th>Hours:</th>
                    <td class="emphcolor">{{ hours }}</td>
                </tr>
                <tr>
                    <th>Start Date:</th>
                    <td>{{ start_date | date: "%b %d, %Y" }}</td>
                </tr>
                <tr>
                    <th>End Date:</th>
                    <td>{{ end_date | date: "%b %d, %Y" }}</td>
                </tr>
                <tr>
                    <th>Rate:</th>
                    <td>{{ pay_period_desc }}</td>
                </tr>
            </table>

            <p>
                Your appointment will be for {{ hours }} hours for {{
                position_code }}. Your Course Coordinator(s) {{
                instructor_contact_desc }} will be in contact with you. You will
                be paid {{ pay_period_desc }} for this position. You will be
                paid in {{ installments }} instalments, once per month for the
                period of your appointment. Your salary will be paid by direct
                deposit.
            </p>
            Your payroll documentation will be available online through the
            University’s Employee Self-Service (ESS) at
            <a href="http://ess.hrandequity.utoronto.ca/"
                >ess.hrandequity.utoronto.ca/</a
            >. This includes electronic delivery of your pay statement, tax
            documentation, and other payroll documentation as made available
            from time to time. You are able to print copies of these documents
            directly from ESS.
            <p>
                By signing this Employment Agreement, you authorize the
                University to provide your T4 slips electronically and not in a
                paper format. If you wish to discuss an alternative format,
                please contact Central Payroll Services at
                payroll.hr@utoronto.ca.
            </p>
            <p>
                This appointment is being granted on the basis that you are a
                student or Post-Doctoral Fellow (PDF) at the University of
                Toronto on the starting date of the appointment. If you are not
                a student or PDF on the starting date of this appointment, this
                offer is revoked and the University will have no obligations
                under this letter.
            </p>
            <p>
                As a Teaching Assistant, you will be a member of the Canadian
                Union of Public Employees (CUPE) Local 3902, Unit 1 bargaining
                unit. Your employment will be governed by the terms and
                conditions of the collective agreement between the University of
                Toronto and CUPE Local 3902, which may be found on the web at
                <br />
                <a
                    href="http://agreements.hrandequity.utoronto.ca/#CUPE3902_Unit1"
                    >agreements.hrandequity.utoronto.ca/#CUPE3902_Unit1</a
                >
                <br />
                Once you accept the offer of employment, a copy of the agreement
                will be given to you if you do not already have one. A statement
                about the Union, along with other information about the Union,
                can be found on the Union's website (<a
                    href="http://www.cupe3902.org/unit-1/"
                    >http://www.cupe3902.org/unit-1/</a
                >). All of this information is that of the Union, represents the
                views of the Union, and has not been approved or endorsed by the
                University.
            </p>
            <h3>Required Training</h3>
            <p>
                You are required to take the following training:
            </p>
            <ul>
                <li>
                    U of T AODA Online Training, provided by the Accessibility
                    for Ontarians with Disabilities Act (AODA) Office, available
                    at
                    <a href="http://aoda.hrandequity.utoronto.ca/"
                        >aoda.hrandequity.utoronto.ca/</a
                    >
                </li>
            </ul>
            <p>
                If you are new to the University, or have not previously
                completed the training, you will be notified by email when the
                training module becomes available for your completion, normally
                one month after the start date of this appointment. Completion
                of this training will be automatically captured in the system
                and you will be paid for this training in accordance with the
                rates set out in your collective agreement. Please note that you
                only need to complete the above training program once with the
                University.
            </p>
            <h3>Policies & Procedures</h3>
            <p>
                You will also be subject to and bound by University policies of
                general application and their related guidelines. The policies
                are listed on the Governing Council website at
                <a
                    href="http://www.governingcouncil.utoronto.ca/Governing_Council/Policies.htm"
                    >www.governingcouncil.utoronto.ca/Governing_Council/Policies.htm</a
                >
                For convenience, a partial list of policies, those applicable to
                all employees, and related guidelines can be found on the Human
                Resources and Equity website at policies.hrandequity.utoronto.ca
                Printed versions will be provided, upon request, through Human
                Resources or your supervisor.
            </p>
            <p>
                You should pay particular attention to those policies which
                confirm the University’s commitment to, and your obligation to
                support, a workplace that is free from discrimination and
                harassment as set out in the Human Rights Code, is safe as set
                out in the Occupational Health and Safety Act, and that respects
                the University's commitment to equity and to workplace civility.
            </p>
            <p>
                All of the applicable policies may be amended and/or new
                policies may be introduced from time to time. When this happens,
                if notice is required you will be given notice as the University
                deems necessary and the amendments will become binding terms of
                your employment contract with the University.
            </p>
            <h3>Accessibility</h3>
            <p>
                The University has a number of programs and services available
                to employees who have need of accommodation due to disability
                through its Health & Well-being Programs and Services (<a
                    href="http://www.hrandequity.utoronto.ca/about-hr-equity/health.htm"
                    >www.hrandequity.utoronto.ca/about-hr-equity/health.htm</a
                >). A description of the accommodation process is available in
                the Accommodation for Employees with Disabilities: U of T
                Guidelines, which may be found at:
                <br />
                <a
                    href="http://well-being.hrandequity.utoronto.ca/services/#accommodation"
                    >well-being.hrandequity.utoronto.ca/services/#accommodation</a
                >
                <br />
                In the event that you have a disability that would impact upon
                how you would respond to an emergency in the workplace (e.g.,
                situations requiring evacuation), you should contact Health &
                Well-being Programs & Services at 416.978.2149 as soon as
                possible so that you can be provided with information regarding
                an individualized emergency response plan.
            </p>
            <p>
                The law requires the Employment Standards Act Poster to be
                provided to all employees; it is available on the HR & Equity
                website at
                <a
                    href="http://www.hrandequity.utoronto.ca/news/employment-standards-ontario"
                    >www.hrandequity.utoronto.ca/news/employment-standards-ontario</a
                >
                This poster describes the minimum rights and obligations
                contained in the Employment Standards Act. Please note that in
                many respects this offer of employment exceeds the minimum
                requirements set out in the Act.
            </p>
            <p>
                Your duties may include all or any combination of the following:
                grading, scheduled tutorials, office hours, Math Aid Centre
                hours, and test and exam invigilation. You will be expected to
                complete all grading for all student work that is completed
                during the term of the appointment, up to and including final
                exams.
            </p>
            <p>
                Within 15 working days after the date of this letter, you will
                be given the opportunity to review the Description of Duties and
                Allocation of Hours (DDAH) form, which will set out more
                specifically the duties of your position, and the hours assigned
                to each.
            </p>
            <p>
                Please sign below to indicate your acceptance of this offer, and
                return a copy of this letter to me as soon as possible but no
                later than 2 days after you have been provided with the DDAH
                form. If we have not heard from you by this deadline, this offer
                may be withdrawn. If you are unable to accept this offer, please
                advise me immediately.
            </p>
            <p>
                If you have any questions, please contact me via email at
                <a href="mailto:tacoord@toronto.edu">tacoord@toronto.edu</a>
            </p>
        </div>
        <div class="letter-foot tacoordinator">
            <p>Yours sincerely,</p>
            <div class="signature">Tom Tomson</div>
            <div class="details">
                Tom Tomson<br />TA Coordinator<br />Some Department
            </div>
        </div>
        <div>
            <p>
                <span class="checkbox"
                    >{% if signature == blank %}☐{% else %}☑{% endif %}</span
                >
                I confirm that I will be registered as a University of Toronto
                student or PDF on the date that this appointment begins. I
                understand that if I should cease to be registered as a
                University of Toronto student or PDF during the period of this
                appointment, for any reason other than convocation, I must
                immediately notify my supervisor, and my appointment may be
                terminated.
            </p>
        </div>
        <div class="letter-foot applicant">
            <p>Please sign below to accept this offer.</p>
            <div class="signature">{{ signature }}</div>
            <div class="details">
                Applicant Signature
            </div>
        </div>
    </body>
</html>`,
    "/math/oto.html": `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Offer Letter</title>
        <style>
            * {
                box-sizing: border-box;
            }
            html {
                margin: 0;
                padding: 0;
            }
            body {
                width: 8.5in;
                margin: 0;
                padding-left: 0.75in;
                padding-right: 0.75in;
                hyphens: auto;
                text-align: justify;
                box-sizing: border-box;
                font-family: Helvetica, sans-serif;
                font-size: 12pt;
            }
            .i {
                font-style: italic;
            }
            .emphcolor {
                color: red;
            }
            table.appointment-summary {
                margin-left: 1in;
                font-size: 0.9em;
            }
            .appointment-summary th {
                padding-right: 0.5em;
                text-align: right;
                font-weight: normal;
            }
            .letter-head p {
                margin-bottom: 0.5in;
            }
            .letter-foot {
                margin-top: 1in;
            }
            .signature {
                font-family: alex_brushregular, cursive;
                font-size: 30pt;
                margin-left: 0.5in;
                margin-bottom: 0.1in;
            }
            .applicant .signature {
                border-bottom: 1px solid black;
                min-width: 2.5in;
                display: inline-block;
                margin-left: 0;
            }
            .checkbox {
                font-size: 18pt;
            }

            @media only screen and (max-width: 9in) {
                /* when printed, these styles won't show
				because the "screen" is 8.5in */
                body {
                    width: unset;
                    padding-bottom: 0.5in;
                    padding-left: 2em;
                    padding-right: 2em;
                }
            }
        </style>
        <link rel="stylesheet" href="font.css" />
        <link rel="stylesheet" href="header.css" />
        <!-- for rendering with wkhtmltopdf styles need to be inlined; when rendered directly in a browser,
	this will just be invalid CSS -->
        <style>
            {{ style_font }}
        </style>
        <style>
            {{ style_header }}
        </style>
    </head>
    <body>
        <div class="letter-head">
            <div class="uoftlogo"></div>
            <p>{{ date }}</p>
            <p>
                {{ first_name }} {{ last_name }}<br />
                c/o Some Department<br />
                University of Toronto
            </p>
            <p>Dear {{ first_name }},</p>
        </div>
        <div class="letter-body">
            <p>
                I am pleased to offer you an appointment as a Teaching Assistant
                in Some Department. The starting date of your appointment will
                be {{ start_date | date: "%b %d, %Y" }} and this appointment
                will end on {{ end_date | date: "%b %d, %Y" }} with no further
                notice to you.
            </p>
            <h3 class="i">Appointment Summary</h3>
            <table class="appointment-summary">
                <tr>
                    <th>Appointment:</th>
                    <td class="emphcolor">
                        {{ position_code }} {{ position_title }}
                    </td>
                </tr>
                <tr>
                    <th>Hours:</th>
                    <td class="emphcolor">{{ hours }}</td>
                </tr>
                <tr>
                    <th>Start Date:</th>
                    <td>{{ start_date | date: "%b %d, %Y" }}</td>
                </tr>
                <tr>
                    <th>End Date:</th>
                    <td>{{ end_date | date: "%b %d, %Y" }}</td>
                </tr>
                <tr>
                    <th>Rate:</th>
                    <td>{{ pay_period_desc }}</td>
                </tr>
            </table>

            <p>
                Your appointment will be for {{ hours }} hours for {{
                position_code }}. This is a ONE TIME ONLY appointment. Your Course Coordinator(s) {{
                instructor_contact_desc }} will be in contact with you. You will
                be paid {{ pay_period_desc }} for this position. You will be
                paid in one instalment. Your salary will be paid by direct
                deposit.
            </p>
            Your payroll documentation will be available online through the
            University’s Employee Self-Service (ESS) at
            <a href="http://ess.hrandequity.utoronto.ca/"
                >ess.hrandequity.utoronto.ca/</a
            >. This includes electronic delivery of your pay statement, tax
            documentation, and other payroll documentation as made available
            from time to time. You are able to print copies of these documents
            directly from ESS.
            <p>
                By signing this Employment Agreement, you authorize the
                University to provide your T4 slips electronically and not in a
                paper format. If you wish to discuss an alternative format,
                please contact Central Payroll Services at
                payroll.hr@utoronto.ca.
            </p>
            <p>
                This appointment is being granted on the basis that you are a
                student or Post-Doctoral Fellow (PDF) at the University of
                Toronto on the starting date of the appointment. If you are not
                a student or PDF on the starting date of this appointment, this
                offer is revoked and the University will have no obligations
                under this letter.
            </p>
            <p>
                As a Teaching Assistant, you will be a member of the Canadian
                Union of Public Employees (CUPE) Local 3902, Unit 1 bargaining
                unit. Your employment will be governed by the terms and
                conditions of the collective agreement between the University of
                Toronto and CUPE Local 3902, which may be found on the web at
                <br />
                <a
                    href="http://agreements.hrandequity.utoronto.ca/#CUPE3902_Unit1"
                    >agreements.hrandequity.utoronto.ca/#CUPE3902_Unit1</a
                >
                <br />
                Once you accept the offer of employment, a copy of the agreement
                will be given to you if you do not already have one. A statement
                about the Union, along with other information about the Union,
                can be found on the Union's website (<a
                    href="http://www.cupe3902.org/unit-1/"
                    >http://www.cupe3902.org/unit-1/</a
                >). All of this information is that of the Union, represents the
                views of the Union, and has not been approved or endorsed by the
                University.
            </p>
            <h3>Required Training</h3>
            <p>
                You are required to take the following training:
            </p>
            <ul>
                <li>
                    U of T AODA Online Training, provided by the Accessibility
                    for Ontarians with Disabilities Act (AODA) Office, available
                    at
                    <a href="http://aoda.hrandequity.utoronto.ca/"
                        >aoda.hrandequity.utoronto.ca/</a
                    >
                </li>
            </ul>
            <p>
                If you are new to the University, or have not previously
                completed the training, you will be notified by email when the
                training module becomes available for your completion, normally
                one month after the start date of this appointment. Completion
                of this training will be automatically captured in the system
                and you will be paid for this training in accordance with the
                rates set out in your collective agreement. Please note that you
                only need to complete the above training program once with the
                University.
            </p>
            <h3>Policies & Procedures</h3>
            <p>
                You will also be subject to and bound by University policies of
                general application and their related guidelines. The policies
                are listed on the Governing Council website at
                <a
                    href="http://www.governingcouncil.utoronto.ca/Governing_Council/Policies.htm"
                    >www.governingcouncil.utoronto.ca/Governing_Council/Policies.htm</a
                >
                For convenience, a partial list of policies, those applicable to
                all employees, and related guidelines can be found on the Human
                Resources and Equity website at policies.hrandequity.utoronto.ca
                Printed versions will be provided, upon request, through Human
                Resources or your supervisor.
            </p>
            <p>
                You should pay particular attention to those policies which
                confirm the University’s commitment to, and your obligation to
                support, a workplace that is free from discrimination and
                harassment as set out in the Human Rights Code, is safe as set
                out in the Occupational Health and Safety Act, and that respects
                the University's commitment to equity and to workplace civility.
            </p>
            <p>
                All of the applicable policies may be amended and/or new
                policies may be introduced from time to time. When this happens,
                if notice is required you will be given notice as the University
                deems necessary and the amendments will become binding terms of
                your employment contract with the University.
            </p>
            <h3>Accessibility</h3>
            <p>
                The University has a number of programs and services available
                to employees who have need of accommodation due to disability
                through its Health & Well-being Programs and Services (<a
                    href="http://www.hrandequity.utoronto.ca/about-hr-equity/health.htm"
                    >www.hrandequity.utoronto.ca/about-hr-equity/health.htm</a
                >). A description of the accommodation process is available in
                the Accommodation for Employees with Disabilities: U of T
                Guidelines, which may be found at:
                <br />
                <a
                    href="http://well-being.hrandequity.utoronto.ca/services/#accommodation"
                    >well-being.hrandequity.utoronto.ca/services/#accommodation</a
                >
                <br />
                In the event that you have a disability that would impact upon
                how you would respond to an emergency in the workplace (e.g.,
                situations requiring evacuation), you should contact Health &
                Well-being Programs & Services at 416.978.2149 as soon as
                possible so that you can be provided with information regarding
                an individualized emergency response plan.
            </p>
            <p>
                The law requires the Employment Standards Act Poster to be
                provided to all employees; it is available on the HR & Equity
                website at
                <a
                    href="http://www.hrandequity.utoronto.ca/news/employment-standards-ontario"
                    >www.hrandequity.utoronto.ca/news/employment-standards-ontario</a
                >
                This poster describes the minimum rights and obligations
                contained in the Employment Standards Act. Please note that in
                many respects this offer of employment exceeds the minimum
                requirements set out in the Act.
            </p>
            <p>
                Your duties may include all or any combination of the following:
                grading, scheduled tutorials, office hours, Math Aid Centre
                hours, and test and exam invigilation. You will be expected to
                complete all grading for all student work that is completed
                during the term of the appointment, up to and including final
                exams.
            </p>
            <p>
                Within 15 working days after the date of this letter, you will
                be given the opportunity to review the Description of Duties and
                Allocation of Hours (DDAH) form, which will set out more
                specifically the duties of your position, and the hours assigned
                to each.
            </p>
            <p>
                Please sign below to indicate your acceptance of this offer, and
                return a copy of this letter to me as soon as possible but no
                later than 2 days after you have been provided with the DDAH
                form. If we have not heard from you by this deadline, this offer
                may be withdrawn. If you are unable to accept this offer, please
                advise me immediately.
            </p>
            <p>
                If you have any questions, please contact me via email at
                <a href="mailto:tacoord@toronto.edu">tacoord@toronto.edu</a>
            </p>
        </div>
        <div class="letter-foot tacoordinator">
            <p>Yours sincerely,</p>
            <div class="signature">Tom Tomson</div>
            <div class="details">
                Tom Tomson<br />TA Coordinator<br />Some Department
            </div>
        </div>
        <div>
            <p>
                <span class="checkbox"
                    >{% if signature == blank %}☐{% else %}☑{% endif %}</span
                >
                I confirm that I will be registered as a University of Toronto
                student or PDF on the date that this appointment begins. I
                understand that if I should cease to be registered as a
                University of Toronto student or PDF during the period of this
                appointment, for any reason other than convocation, I must
                immediately notify my supervisor, and my appointment may be
                terminated.
            </p>
        </div>
        <div class="letter-foot applicant">
            <p>Please sign below to accept this offer.</p>
            <div class="signature">{{ signature }}</div>
            <div class="details">
                Applicant Signature
            </div>
        </div>
    </body>
</html>`,
};
// It's not important to store separate HTML templates for each of these
// so just duplicate an existing template.
contract_templates_by_filename["/math/default2018.html"] =
    contract_templates_by_filename["/math/default.html"];
contract_templates_by_filename["/math/invigilate.html"] =
    contract_templates_by_filename["/math/default.html"];
contract_templates_by_filename["/math/invigilate2014.html"] =
    contract_templates_by_filename["/math/default.html"];

export const mockData = {
    sessions: [
        {
            id: 1,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            name: "2019 Fall",
            rate1: 45.55,
            rate2: 47.33,
        },
        {
            id: 2,
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-04-30T00:00:00.000Z",
            name: "2021 Spring",
            rate1: 45.55,
            rate2: null,
        },
    ],
    available_contract_templates: [
        {
            template_file: "/math/default.html",
        },
        {
            template_file: "/math/default2018.html",
        },
        {
            template_file: "/math/invigilate.html",
        },
        {
            template_file: "/math/invigilate2014.html",
        },
        {
            template_file: "/math/oto.html",
        },
    ],
    contract_templates: [
        {
            id: 1,
            template_name: "standard",
            template_file: "/math/default.html",
        },
        {
            id: 2,
            template_name: "oto",
            template_file: "/math/oto.html",
        },
        {
            id: 3,
            template_name: "standard",
            template_file: "/math/default2018.html",
        },
        {
            id: 4,
            template_name: "invigilate",
            template_file: "/math/invigilate.html",
        },
    ],
    contract_templates_by_session: {
        1: [1, 2],
        2: [3, 4],
    },
    contract_templates_by_filename: contract_templates_by_filename,
    instructors: [
        {
            id: 1000,
            last_name: "Smith",
            first_name: "Henry",
            email: "hery.smith@utoronto.ca",
            utorid: "smithh",
        },
        {
            id: 1001,
            last_name: "Garcia",
            first_name: "Emily",
            email: "emily.garcia@utoronto.ca",
            utorid: "garciae",
        },
        {
            id: 1002,
            last_name: "Miller",
            first_name: "Megan",
            email: "megan.miller@utoronto.ca",
            utorid: "millerm",
        },
        {
            id: 1003,
            last_name: "Beera",
            first_name: "Lizzy",
            email: "lizzy.beera@utoronto.ca",
            utorid: "beeral",
        },
    ],
    positions_by_session: {
        1: [10, 11, 14, 15, 16],
        2: [12, 13],
    },
    positions: [
        {
            id: 10,
            position_code: "MAT135H1F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            contract_template_id: 1,
            duties: "Tutorials",
            qualifications: "Teaching skill",
            desired_num_assignments: 15,
            current_enrollment: 1200,
            current_waitlisted: 200,
            instructor_ids: [1000, 1001],
            instructor_preferences: [
                {
                    preference_level: 2,
                    applicant_id: 2000,
                    instructor_id: 1000,
                },
                {
                    preference_level: 1,
                    applicant_id: 2002,
                    instructor_id: 1000,
                },
                {
                    preference_level: -1,
                    applicant_id: 2005,
                    instructor_id: 1001,
                },
                {
                    preference_level: 1,
                    applicant_id: 2002,
                    instructor_id: 1001,
                },
                {
                    preference_level: 1,
                    applicant_id: 2006,
                    instructor_id: 1001,
                },
            ],
        },
        {
            id: 11,
            position_code: "MAT136H1F",
            position_title: "Calculus II",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            contract_template_id: 2,
            instructor_ids: [],
        },
        {
            id: 12,
            position_code: "CSC135H1F",
            position_title: "Computer Fun",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            duties: "Tutorials",
            contract_template_id: 3,
            instructor_ids: [1000],
            instructor_preferences: [
                {
                    preference_level: -1,
                    applicant_id: 2005,
                    instructor_id: 1000,
                },
                {
                    preference_level: 2,
                    applicant_id: 2001,
                    instructor_id: 1000,
                },
                {
                    preference_level: 1,
                    applicant_id: 2006,
                    instructor_id: 1000,
                },
            ],
        },
        {
            id: 13,
            position_code: "MAT235H1F",
            position_title: "Calculus III",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            contract_template_id: 3,
            instructor_ids: [1002],
            instructor_preferences: [
                {
                    preference_level: 2,
                    applicant_id: 2000,
                    instructor_id: 1002,
                },
                {
                    preference_level: 1,
                    applicant_id: 2002,
                    instructor_id: 1002,
                },
            ],
        },
        {
            instructor_ids: [1002],
            position_code: "CSC100H1S",
            position_title: "Computers for Humans",
            hours_per_assignment: 100,
            duties:
                "Some combination of marking, invigilating, tutorials, office hours, and the help centre.",
            contract_template_id: 1,
            start_date: "2021-01-01T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 14,
        },
        {
            instructor_ids: [1000],
            position_code: "MAT137Y1Y",
            position_title: "Calculus!",
            hours_per_assignment: 250,
            duties:
                "Some combination of marking, invigilating, tutorials, office hours, and the help centre.",
            contract_template_id: 1,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            qualifications: "Skilled Proofs Reader",
            current_enrollment: 1500,
            current_waitlisted: 78,
            desired_num_assignments: 22,
            id: 15,
        },
        {
            instructor_ids: [1001],
            position_code: "MAT135H1F Head TA",
            position_title: "Calculus I",
            hours_per_assignment: 225,
            duties: "Top-notch Head TA Stuff",
            contract_template_id: 1,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            desired_num_assignments: 3,
            id: 16,
        },
    ],
    applicants: [
        {
            id: 2000,
            utorid: "weasleyr",
            student_number: "89013443",
            first_name: "Ron",
            last_name: "Weasley",
            email: "ron@potter.com",
            phone: "543-223-9993",
        },
        {
            id: 2001,
            utorid: "potterh",
            student_number: "999666999",
            first_name: "Harry",
            last_name: "Potter",
            email: "harry@potter.com",
        },
        {
            id: 2002,
            utorid: "smithb",
            email: "smithb@mail.utoronto.ca",
            first_name: "Bethany",
            last_name: "Smith",
            student_number: "131382748",
        },
        {
            id: 2003,
            utorid: "wilsonh",
            email: "wilsonh@mail.utoronto.ca",
            first_name: "Hanna",
            last_name: "Wilson",
            student_number: "600366904",
        },
        {
            id: 2004,
            utorid: "molinat",
            email: "molinat@mail.utoronto.ca",
            first_name: "Troy",
            last_name: "Molina",
            student_number: "328333023",
        },
        {
            id: 2005,
            utorid: "howeyb",
            email: "howeyb@mail.utoronto.ca",
            first_name: "Brett",
            last_name: "Howey",
            student_number: "329613524",
        },
        {
            id: 2006,
            utorid: "brownd",
            email: "brownd@mail.utoronto.ca",
            first_name: "David",
            last_name: "Brown",
            student_number: "29151485",
        },
    ],
    assignments_by_session: {
        1: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109],
        2: [],
    },
    assignments: [
        {
            id: 100,
            position_id: 10,
            applicant_id: 2001,
            hours: 90,
        },
        {
            id: 101,
            position_id: 10,
            applicant_id: 2005,
            hours: 95,
        },
        {
            note: "",
            position_id: 16,
            applicant_id: 2000,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            id: 102,
        },
        {
            note: "",
            position_id: 16,
            applicant_id: 2002,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            id: 103,
        },
        {
            note: "",
            position_id: 15,
            applicant_id: 2001,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 104,
        },
        {
            note: "",
            position_id: 15,
            applicant_id: 2002,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 105,
        },
        {
            note: "",
            position_id: 15,
            applicant_id: 2005,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 106,
        },
        {
            note: "",
            position_id: 15,
            applicant_id: 2000,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 107,
        },
        {
            note: "",
            position_id: 15,
            applicant_id: 2006,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 108,
        },
        {
            note: "",
            position_id: 14,
            applicant_id: 2002,
            start_date: "2021-01-01T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
            id: 109,
        },
    ],
    wage_chunks: [
        {
            id: 3000,
            assignment_id: 100,
            hours: 20,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            rate: 10.01,
        },
        {
            id: 3001,
            assignment_id: 100,
            hours: 35,
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-04-20T00:00:00.000Z",
            rate: 12.02,
        },
        {
            id: 3002,
            assignment_id: 101,
            hours: 95,
            start_date: "2019-09-01T00:00:00.000Z",
            end_date: "2020-04-20T00:00:00.000Z",
            rate: null,
        },
        {
            id: 3003,
            assignment_id: 102,
            hours: 225,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
        },
        {
            id: 3004,
            assignment_id: 103,
            hours: 225,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
        },
        {
            id: 3005,
            assignment_id: 104,
            hours: 125,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T05:00:00.000Z",
        },
        {
            id: 3006,
            assignment_id: 104,
            hours: 125,
            start_date: "2020-01-01T05:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
        },
        {
            id: 3007,
            assignment_id: 105,
            hours: 125,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T05:00:00.000Z",
        },
        {
            id: 3008,
            assignment_id: 105,
            hours: 125,
            start_date: "2020-01-01T05:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
        },
        {
            id: 3009,
            assignment_id: 106,
            hours: 125,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T05:00:00.000Z",
        },
        {
            id: 3010,
            assignment_id: 106,
            hours: 125,
            start_date: "2020-01-01T05:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
        },
        {
            id: 3011,
            assignment_id: 107,
            hours: 100,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T05:00:00.000Z",
        },
        {
            id: 3012,
            assignment_id: 107,
            hours: 100,
            start_date: "2020-01-01T05:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
        },
        {
            id: 3013,
            assignment_id: 108,
            hours: 100,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T05:00:00.000Z",
        },
        {
            id: 3014,
            assignment_id: 108,
            hours: 100,
            start_date: "2020-01-01T05:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
        },
        {
            id: 3015,
            assignment_id: 109,
            hours: 100,
            start_date: "2021-01-01T00:00:00.000Z",
            end_date: "2020-04-03T00:00:00.000Z",
        },
    ],
    offers: [
        {
            id: 10000,
            assignment_id: 100,
            status: "withdrawn",
        },
        {
            id: 10001,
            assignment_id: 100,
            status: "pending",
        },
        {
            id: 10002,
            assignment_id: 101,
            status: "accepted",
        },
        {
            id: 10003,
            assignment_id: 102,
            status: "withdrawn",
        },
    ],
    applications: [
        {
            id: 15000,
            comments: "",
            program: "Phd",
            department: "Computer Science",
            previous_uoft_ta_experience: "Last year I TAed a bunch",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2000,
            position_preferences: [
                {
                    preference_level: 2,
                    position_id: 10,
                },
                {
                    preference_level: 3,
                    position_id: 15,
                },
            ],
        },
        {
            id: 15001,
            comments: "",
            program: "UG",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2001,
            position_preferences: [
                {
                    preference_level: 0,
                    position_id: 12,
                },
                {
                    preference_level: 3,
                    position_id: 13,
                },
            ],
        },
        {
            id: 15002,
            comments: "",
            program: "Phd",
            department: "Math",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2002,
            position_preferences: [
                {
                    preference_level: 3,
                    position_id: 10,
                },
                {
                    preference_level: 3,
                    position_id: 13,
                },
                {
                    preference_level: 2,
                    position_id: 12,
                },
                {
                    preference_level: 0,
                    position_id: 11,
                },
            ],
        },
        {
            id: 15003,
            comments: "",
            program: "Phd",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2005,
            position_preferences: [
                {
                    preference_level: 2,
                    position_id: 10,
                },
                {
                    preference_level: 3,
                    position_id: 13,
                },
                {
                    preference_level: 0,
                    position_id: 12,
                },
                {
                    preference_level: 1,
                    position_id: 11,
                },
            ],
        },
        {
            id: 15004,
            comments: "",
            program: "UG",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2006,
            position_preferences: [
                {
                    preference_level: 3,
                    position_id: 10,
                },
                {
                    preference_level: 0,
                    position_id: 13,
                },
                {
                    preference_level: 2,
                    position_id: 12,
                },
            ],
        },
        {
            id: 15005,
            comments: "",
            program: "UG",
            department: "Math",
            previous_uoft_ta_experience: "",
            yip: 3,
            annotation: "",
            session_id: 2,
            applicant_id: 2002,
            position_preferences: [
                {
                    preference_level: 3,
                    position_id: 10,
                },
                {
                    preference_level: 3,
                    position_id: 13,
                },
                {
                    preference_level: 2,
                    position_id: 12,
                },
                {
                    preference_level: 0,
                    position_id: 11,
                },
            ],
        },
        {
            id: 15006,
            comments: "",
            program: "MSc",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 2,
            applicant_id: 2003,
            position_preferences: [
                {
                    preference_level: 3,
                    position_id: 10,
                },
                {
                    preference_level: 3,
                    position_id: 13,
                },
                {
                    preference_level: 2,
                    position_id: 12,
                },
                {
                    preference_level: 0,
                    position_id: 11,
                },
            ],
        },
        {
            id: 15007,
            comments: "",
            program: "UG",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 4,
            annotation: "",
            session_id: 2,
            applicant_id: 2004,
            position_preferences: [
                {
                    preference_level: 1,
                    position_id: 10,
                },
                {
                    preference_level: 3,
                    position_id: 13,
                },
            ],
        },
    ],
    ddahs: [
        {
            id: 700,
            assignment_id: 100,
            signature: null,
            approved_date: null,
            accepted_date: null,
            revised_date: null,
            emailed_date: null,
            url_token: "DJAKSLJLFD",
            duties: [
                {
                    order: 2,
                    hours: 25,
                    description: "marking:Marking the midterm",
                },
                {
                    order: 1,
                    hours: 4,
                    description: "training:Initial training",
                },
                {
                    order: 3,
                    hours: 40,
                    description: "contact:Running tutorials",
                },
            ],
        },
        {
            id: 701,
            assignment_id: 101,
            signature: "Brett Howey",
            approved_date: null,
            accepted_date: "2019-09-02T00:00:00.000Z",
            revised_date: null,
            emailed_date: "2019-09-02T00:00:00.000Z",
            url_token: "somerandomtoken",
            duties: [
                {
                    order: 2,
                    hours: 50,
                    description: "marking:Marking the midterm",
                },
                {
                    order: 1,
                    hours: 6,
                    description: "training:Initial training",
                },
            ],
        },
    ],
    users: [
        {
            email: "hery.smith@utoronto.ca",
            utorid: "smithh",
            roles: ["admin", "instructor"],
        },
        {
            email: "emily.garcia@utoronto.ca",
            utorid: "garciae",
            roles: ["instructor"],
        },
        {
            email: "megan.miller@utoronto.ca",
            utorid: "millerm",
            roles: ["instructor"],
        },
        {
            email: "lizzy.beera@utoronto.ca",
            utorid: "beeral",
            roles: ["instructor"],
        },
    ],
    active_user: "smithh",
};
