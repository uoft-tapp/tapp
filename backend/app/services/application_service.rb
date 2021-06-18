# frozen_string_literal: true

class ApplicationService
    include TransactionHandler
    attr_reader :application

    def initialize(application: nil)
        @application = application
        @applicant = @application ? @application.applicant : nil
    end

    # Return the "prefilled data" associated with this application. This is the data that
    # can be prefilled when an application re-fills out an application
    def prefilled_data
        data = {}
        return data if @application.blank?

        # Grab the non-nil attributes from the application that we want to return.
        # Some attributes, like `annotation`, are private, and shouldn't be returned.
        application_data =
            @application.attributes.slice(
                'program',
                'department',
                'yip',
                'previous_department_ta',
                'previous_university_ta',
                'previous_experience_summary',
                'gpa',
                'comments'
            ).select { |k, v| !v.nil? }
        data.merge! application_data

        # Custom question answers are stored as a JSON blob in the database. We unpack them if there are any
        if @application.custom_question_answers
            data.merge! @application.custom_question_answers
        end

        # Position-preferences must be reconstructed from the database. Surveyjs expects
        # an object { [course_code]: preference_level }
        position_preferences = {}
        position_preferences_subs.each do |preference|
            position_preferences[preference['position_code']] =
                preference['preference_level']
        end
        data[:position_preferences] = position_preferences

        data.symbolize_keys!
    end

    # Generate JSON subsitutisions that can be used in a liquit template
    def subs
        {
            email: @applicant.email,
            first_name: @applicant.first_name,
            last_name: @applicant.last_name,
            utorid: @applicant.utorid,
            student_number: @applicant.student_number,
            phone: @applicant.phone,
            posting_name: @application.posting.name,
            position_preferences: position_preferences_subs,
            ta_coordinator_name: Rails.application.config.ta_coordinator_name,
            ta_coordinator_email: Rails.application.config.ta_coordinator_email,
            updated_date:
                [
                    # When resubmitting application, it's possible the application didn't change,
                    # but instead the applicant information changed. We look for the most recent
                    # updated date in that case.
                    @application.updated_at,
                    @applicant.updated_at
                ].max.in_time_zone('Eastern Time (US & Canada)'),
            program: @application.program,
            department: @application.department,
            previous_department_ta: @application.previous_department_ta,
            previous_university_ta: @application.previous_university_ta,
            previous_experience_summary:
                @application.previous_experience_summary,
            comments: @application.comments
        }
    end

    private

    # Assemble JSON that can be used to do the substitutions in a liquid template.
    def position_preferences_subs
        PositionPreference.joins(:position).where(
            id: application.position_preference_ids
        ).pluck(:"positions.position_code", :preference_level)
            .map do |(position_code, preference_level)|
            {
                position_code: position_code, preference_level: preference_level
            }.stringify_keys
        end
    end
end
