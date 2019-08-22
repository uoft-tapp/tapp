# frozen_string_literal: true

FactoryBot.define do
    factory :position do
        association :session, :fall # Have it be fall by default
        cap_enrolment { 10 }
        course_code { 'CSC148' }
        course_name { 'Introduction to Computer Science' }
        current_enrolment { 20 }
        duties { 'Do TA stuff' }
        hours { 400 }
        num_waitlisted { 50 }
        openings { 10 }
        qualifications { 'Do more stuff' }
    end
end
