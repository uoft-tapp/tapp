# frozen_string_literal: true

class DdahMailer < ApplicationMailer
    def email_ddah(ddah)
        generate_vars(ddah)
        mail(
            to: @email,
            cc: @instructor_emails,
            from: @ta_coordinator_email,
            subject: "DDAH for #{@position_code} (#{@first_name} #{@last_name})"
        )
    end

    private

    def generate_vars(ddah)
        @ddah = ddah
        @email = ddah.assignment.applicant.email
        @first_name = ddah.assignment.applicant.first_name
        @last_name = ddah.assignment.applicant.last_name
        @instructor_emails = ddah.assignment.position.instructors.map(&:email)
        @position_code = ddah.assignment.position.position_code
        @position_title = ddah.assignment.position.position_title
        @ta_coordinator_email = Rails.application.config.ta_coordinator_email
        # TODO:  This seems too hard-coded.  Is there another way to get the route?
        @url =
            "#{Rails.application.config.base_url}/public/ddahs/#{
                ddah.url_token
            }/view"
    end
end
