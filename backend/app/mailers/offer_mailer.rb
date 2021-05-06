# frozen_string_literal: true

class OfferMailer < ActionMailer::Base
    require 'html_to_plain_text'

    def email_contract(offer)
        populate_vars offer

        debug_message = "Emailing #{@position_code} Offer to \"#{@email}\""
        logger.warn debug_message

        begin
            mail(
                to: @email,
                from: @ta_coordinator_email,
                subject: "TA Position Offer for #{@position_code}"
            ) do |format|
                html = email_html
                # by calling format.html/format.text we can use our own templates
                # in place of the rails erd's.
                format.html { render inline: html }
                format.text do
                    render plain: HtmlToPlainText.plain_text(html)
                end
            end
        rescue Net::SMTPFatalError => e
            raise StandardError, "Error when #{debug_message} (#{e})"
        end
    end

    def email_nag(offer)
        populate_vars offer

        debug_message = "Emailing #{@position_code} Offer Nag to \"#{@email}\""
        logger.warn debug_message

        begin
            mail(
                to: @email,
                from: @ta_coordinator_email,
                subject:
                    "Reminder #{@nag_count}: TA Position Offer for #{
                        @position_code
                    }"
            ) do |format|
                html = nag_email_html
                format.html { render inline: html }
                format.text do
                    render plain: HtmlToPlainText.plain_text(html)
                end
            end
        rescue Net::SMTPFatalError => e
            raise StandardError, "Error when #{debug_message} (#{e})"
        end
    end

    private

    def populate_vars(offer)
        @offer_service = OfferService.new(offer: offer)
        @subs = @offer_service.subs
        @position_code = @subs[:position_code]
        @email = @subs[:email]
        @ta_coordinator_email = @subs[:ta_coordinator_email]
        @nag_count = @subs[:nag_count]
    end

    def email_html
        template = liquid_template('email_contract.html')
        template.render(@subs.stringify_keys)
    end

    def nag_email_html
        template = liquid_template('email_nag.html')
        template.render(@subs.stringify_keys)
    end

    def liquid_template(name)
        template_dir = Rails.root.join('app/views/offer_mailer/')
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
