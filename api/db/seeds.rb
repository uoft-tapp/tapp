# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.
include SeedsHandler

chaining = [
    '/sessions',
    '/sessions/:session_id/add_position_template',
    '/instructors',
    '/sessions/:session_id/positions',
    '/applicants',
    '/sessions/:session_id/applications',
    '/applications/:application_id/add_preference',
    '/positions/:position_id/assignments',
    '/assignments/:assignment_id/add_wage_chunk',
    '/assignments/:assignment_id/add_reporting_tag',
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

# insert_data(chaining, file: 'mock_data.json')
insert_data(chaining, entries: entries)
