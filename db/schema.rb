# frozen_string_literal: true

# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20_181_005_194_520) do
  # These are extensions that must be enabled in order to support this database
  enable_extension 'plpgsql'

  create_table "applicants", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "utorid"
    t.string "student_number"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "phone"
    t.text "address"
    t.text "commentary"
    t.string "dept"
    t.integer "year_in_program"
    t.boolean "is_full_time"
    t.boolean "is_grad"
  end

  create_table 'instructors', force: :cascade do |t|
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.string 'last_name'
    t.string 'first_name'
    t.string 'email'
    t.string 'utorid'
  end

  create_table 'instructors_positions', force: :cascade do |t|
    t.bigint 'instructor_id'
    t.bigint 'position_id'
    t.index ['instructor_id'], name: 'index_instructors_positions_on_instructor_id'
    t.index ['position_id'], name: 'index_instructors_positions_on_position_id'
  end

  create_table "positions", force: :cascade do |t|
    t.bigint "session_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "course_code"
    t.text "course_name"
    t.integer "current_enrolment"
    t.text "duties"
    t.text "qualifications"
    t.integer "hours"
    t.integer "cap_enrolment"
    t.integer "num_waitlisted"
    t.integer "openings"
    t.index ["session_id"], name: "index_positions_on_session_id"
  end

  create_table 'preferences', force: :cascade do |t|
    t.bigint 'applicant_id'
    t.bigint 'position_id'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['applicant_id'], name: 'index_preferences_on_applicant_id'
    t.index ['position_id'], name: 'index_preferences_on_position_id'
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "year"
    t.string "semester"
    t.float "pay"
    t.integer "round"
    t.datetime "round_start"
    t.datetime "round_end"
    t.datetime "session_start"
    t.datetime "session_end"
end
