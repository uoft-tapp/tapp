# frozen_string_literal: true

class PostingMailer < ActionMailer::Base
    require 'html_to_plain_text'

    def email_application_confirmation(application)
        populate_vars application

        debug_message = "Emailing application confirmation to \"#{@email}\""
        logger.warn debug_message

        begin
            mail(
                to: @email,
                from: @ta_coordinator_email,
                subject: "Application Received for #{@posting_name}"
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

    def populate_vars(application)
        application_service = ApplicationService.new(application: application)

        @subs = application_service.subs
        @email = @subs[:email]
        @ta_coordinator_email = @subs[:ta_coordinator_email]
        @posting_name = @subs[:posting_name]
    end

    def email_html
        template = liquid_template('email_application_confirmation.html')
        template.render(@subs.stringify_keys)
    end

    def liquid_template(name)
        template_dir = Rails.root.join('app/views/posting_mailer/')
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
