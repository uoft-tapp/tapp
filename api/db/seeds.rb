# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.
include SeedsHandler

seedData = [
    {
        table: Session,
        create: '/sessions',
        update: '/sessions/:id',
        file: 'session.json',
        unique: [:name],
        foreign_keys: []
    },
    {
        table: PositionTemplate,
        create: '/sessions/:session_id/add_position_template',
        update: '/position_templates/:id',
        file: 'position_template.json',
        unique: [:position_type, :session_id],
        foreign_keys: [
            {
                table: Session,
                key: :session_id
            }
        ]
    },
    {
        table: Position,
        create: '/sessions/:session_id/positions',
        update: '/positions/:id',
        file: 'position.json',
        unique: [:position_code, :session_id],
        foreign_keys: [
            {
                table: Session,
                key: :session_id
            }
        ]
    },
    {
        table: Instructor,
        create: '/instructors',
        update: '/instructors/:id',
        file: 'instructor.json',
        unique: [:utorid],
        foreign_keys: [
            {
                table: Position,
                key: :position_ids,
            }
        ]
    },
    {
        table: Applicant,
        create: '/applicants',
        update: '/applicants/:id',
        file: 'applicant.json',
        unique: [:utorid, :student_number],
        foreign_keys: []
    },
    {
        table: Application,
        create: '/sessions/:session_id/applications',
        update: '/applications/:id',
        file: 'application.json',
        unique: {
            table: ApplicantDataForMatching,
            child_keys: [:applicant_id],
            parent_keys: [:session_id],
            id: :application_id
        },
        foreign_keys: [
            {
                table: Session,
                key: :session_id
            },
            {
                table: Applicant,
                key: :applicant_id
            }
        ]
    },
    {
        table: PositionPreference,
        create: '/applications/:application_id/add_preference',
        update: '/position_preferences/:id',
        file: 'position_preference.json',
        unique: [:application_id, :position_id],
        foreign_keys: [
            {
                table: Position,
                key: :position_id,
            },
            {
                table: Application,
                key: :application_id,
            }
        ]
    },
    {
        table: Assignment,
        create: '/positions/:position_id/assignments',
        update: '/assignments/:id',
        file: 'assignment.json',
        unique: [:application_id, :position_id],
        foreign_keys: [
            {
                table: Position,
                key: :position_id,
            },
            {
                table: Applicant,
                key: :applicant_id,
            }
        ]
    },
    {
        table: WageChunk,
        create: '/assignments/:assignment_id/add_wage_chunk',
        update: '/wage_chunks/:id',
        file: 'wage_chunk.json',
        unique: [:assignment_id],
        foreign_keys: [
            {
                table: Assignment,
                key: :assignment_id,
            }
        ]
    },
    {
        table: ReportingTag,
        create: '/wage_chunks/:wage_chunk_id/add_reporting_tag',
        update: '/reporting_tags/:id',
        file: 'reporting_tag.json',
        unique: [:wage_chunk_id, :position_id],
        foreign_keys: [
            {
                table: WageChunk,
                key: :wage_chunk_id,
            },
            {
                table: Position,
                key: :position_id,
            }
        ]
    },
]

insert_data(seedData)