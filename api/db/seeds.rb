# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.
include SeedsHandler

seed_data_sequence = [
    {
        get: '/sessions',
        create: '/sessions',
    },
    {
        get: '/position_templates',
        create: '/sessions/:session_id/add_position_template',
    },
    {
        get: '/instructors',
        create: '/instructors',
    },
    {
        get: '/positions',
        create: '/sessions/:session_id/positions',
    },
    {
        get: '/applicants',
        create: '/applicants',
    },
    {
        get: '/applications',
        create: '/sessions/:session_id/applications',
    },
    {
        get: '/position_preferences',
        create: '/applications/:application_id/add_preference',
    },
    {
        get: '/assignments',
        create: '/positions/:position_id/assignments',
    },
    {
        get: '/wage_chunks',
        create: '/assignments/:assignment_id/add_wage_chunk',
    },
    {
        get: '/reporting_tags',
        create: '/wage_chunks/:wage_chunk_id/add_reporting_tag',
    }
]
entries = {
    sessions: 3,
    position_templates: 3,
    instructors: 20,
    positions: 50,
    applicants: 100,
    applications: 150,
    position_preferences: 300,
    assignments: 100,
    wage_chunks: 50,
    reporting_tags: 50,
}

insert_data(seed_data_sequence, 'mock_data.json')
