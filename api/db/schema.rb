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

ActiveRecord::Schema.define(version: 2019_05_30_015748) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "applicants", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "utorid"
    t.string "student_number"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "phone"
    t.index ["student_number"], name: "index_applicants_on_student_number", unique: true
    t.index ["utorid"], name: "index_applicants_on_utorid", unique: true
  end

  create_table "assignments", force: :cascade do |t|
    t.bigint "applicant_id"
    t.bigint "position_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "hours"
    t.date "start_date"
    t.date "end_date"
    t.integer "status"
    t.index ["applicant_id", "position_id"], name: "index_assignments_on_applicant_id_and_position_id", unique: true
    t.index ["applicant_id"], name: "index_assignments_on_applicant_id"
    t.index ["position_id"], name: "index_assignments_on_position_id"
  end

  create_table "instructors", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "last_name"
    t.string "first_name"
    t.string "email"
    t.string "utorid"
    t.index ["utorid"], name: "index_instructors_on_utorid", unique: true
  end

  create_table "instructors_positions", force: :cascade do |t|
    t.bigint "instructor_id"
    t.bigint "position_id"
    t.index ["instructor_id"], name: "index_instructors_positions_on_instructor_id"
    t.index ["position_id"], name: "index_instructors_positions_on_position_id"
  end

  create_table "offers", force: :cascade do |t|
    t.bigint "assignment_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "hours"
    t.date "start_date"
    t.date "end_date"
    t.integer "status"
    t.index ["assignment_id"], name: "index_offers_on_assignment_id"
  end

  create_table "positions", force: :cascade do |t|
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
    t.datetime "start_date"
    t.datetime "end_date"
    t.bigint "session_id"
    t.index ["session_id"], name: "index_positions_on_session_id"
  end

  create_table "preferences", force: :cascade do |t|
    t.bigint "applicant_id"
    t.bigint "position_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "priority"
    t.index ["applicant_id", "position_id"], name: "index_preferences_on_applicant_id_and_position_id", unique: true
    t.index ["applicant_id"], name: "index_preferences_on_applicant_id"
    t.index ["position_id"], name: "index_preferences_on_position_id"
  end

  create_table "reporting_tags", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "year"
    t.integer "semester", default: 0
    t.float "pay"
    t.datetime "start_date"
    t.datetime "end_date"
    t.index ["year", "semester"], name: "index_sessions_on_year_and_semester", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "utorid"
    t.integer "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["utorid"], name: "index_users_on_utorid", unique: true
  end

  add_foreign_key "positions", "sessions"
end
