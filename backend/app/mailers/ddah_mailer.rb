# frozen_string_literal: true

class DdahMailer < ActionMailer::Base
    require 'html_to_plain_text'

    def email_ddah(ddah)
        generate_vars(ddah)
        debug_message =
            "Emailing #{@position_code} DDAH to \"#{@email}\" and CCing #{
                @instructor_emails
            }"
        logger.warn debug_message

        begin
            mail(
                to: @email,
                cc: @instructor_emails,
                from: @ta_coordinator_email,
                subject:
                    "DDAH for #{@position_code} (#{@first_name} #{@last_name})"
            ) do |format|
                html = email_html
                # by calling format.html/format.text we can use our own templates
                # in place of the rails erd's.
                format.html { render inline: html }
                format.text { render plain: HtmlToPlainText.plain_text(html) }
            end
        rescue Net::SMTPFatalError => e
            raise StandardError, "Error when #{debug_message} (#{e})"
        end
    end

    private

    def email_html
        template = liquid_template('email_ddah.html')
        template.render(@subs.stringify_keys)
    end

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
        # Note, we are using the `/hash` route proxying (instead of `#` hash)
        # to avoid issues with Shibboleth authentication
        # See details in routes.rb
        @url =
            "#{Rails.application.config.base_url}/hash/public/ddahs/#{
                ddah.url_token
            }"

        @subs = {
            ddah: @ddah,
            email: @email,
            first_name: @first_name,
            last_name: @last_name,
            instructor_emails: @instructor_emails,
            position_code: @position_code,
            position_title: @position_title,
            ta_coordinator_email: @ta_coordinator_email,
            url: @url
        }
    end

    def liquid_template(name)
        template_dir = Rails.root.join('app/views/ddah_mailer/')
        template_file = "#{template_dir}/#{name}"
        # Verify that the template file is actually contained in the template directory
        unless Pathname.new(template_file).realdirpath.to_s.starts_with?(
                   template_dir.to_s
               )
            raise StandardError, "Invalid contract path #{template_file}"
        end

        Liquid::Template.parse(File.read(template_file))
    end
end
