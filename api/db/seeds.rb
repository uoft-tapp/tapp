# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.
include SeedsHandler
include FakeData

chaining = [
    {
        action: :post,
        route: '/sessions',
        record_each: true,
        name: :session,
    },
    {
        action: :post,
        route: '/sessions/:session_id/add_position_template',
        record_each: true,
        name: :position_template,
    }
]

# insert_data(seedData)
