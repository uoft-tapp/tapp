# frozen_string_literal: true

class ApplicationService
    include TransactionHandler
    attr_reader :application

    def initialize(application: nil)
        @application = application
        @applicant = @application ? @application.applicant : nil
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
            # When resubmitting application, it's possible the application didn't change,
            # but instead the applicant information changed. We look for the most recent
            # updated date in that case.
            updated_date: [@application.updated_at, @applicant.updated_at].max,
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
