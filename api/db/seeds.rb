# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.
include SeedsHandler

chaining = [
    {
        get: '/sessions',
        create: '/sessions',
        unique: [:name]
    },
    {
        get: '/position_templates',
        create: '/sessions/:session_id/add_position_template',
        unique: [:session_index, :position_type]
    },
    {
        get: '/instructors',
        create: '/instructors',
        unique: [:utorid]
    },
    {
        get: '/positions',
        create: '/sessions/:session_id/positions',
        unique: [:session_index, :position_code]
    },
    {
        get: '/applicants',
        create: '/applicants',
        unique: [:utorid]
    },
    {
        get: '/applications',
        create: '/sessions/:session_id/applications',
        unique: [:session_index, :applicant_index]
    },
    {
        get: '/position_preferences',
        create: '/applications/:application_id/add_preference',
        unique: [:application_index, :position_index]
    },
    {
        get: '/assignments',
        create: '/positions/:position_id/assignments',
        unique: [:position_index]
    },
    {
        get: '/wage_chunks',
        create: '/assignments/:assignment_id/add_wage_chunk',
        unique: [:assignment_index]
    },
    {
        get: '/reporting_tags',
        create: '/wage_chunks/:wage_chunk_id/add_reporting_tag',
        unique: [:wage_chunk_index]
    }
]
entries = {
    available_position_templates: 5,
    sessions: 3,
    position_templates: 5,
    instructors: 10,
    positions: 40,
    applicants: 10,
    applications: 15,
    preferences: 20,
    assignments: 5,
    wage_chunks: 5,
    reporting_tags: 5,
}

insert_data(chaining, file: 'mock_data.json')
# insert_data(chaining, entries: entries)
