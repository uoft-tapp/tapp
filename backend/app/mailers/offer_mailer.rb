# frozen_string_literal: true

class OfferMailer < ApplicationMailer
    def email_contract(offer)
        generate_vars(offer)
        debug_message = "Emailing #{@position_code} Offer to \"#{@email}\""
        logger.warn debug_message

        begin
            mail(
                to: @email,
                from: @ta_coordinator_email,
                subject: "TA Position Offer for #{@position_code}"
            )
        rescue Net::SMTPFatalError => e
            raise StandardError, "Error when #{debug_message} (#{e})"
        end
    end

    def email_nag(offer)
        generate_vars(offer)

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
            )
        rescue Net::SMTPFatalError => e
            raise StandardError, "Error when #{debug_message} (#{e})"
        end
    end

    private

    def prev_offer_diff
        latest = Offer.order(withdrawn_date: :desc).limit(2)
        if latest.length == 2 && @hours != latest[1].hours
            @diff = latest[1].hours
        end
    end

    def generate_vars(offer)
        @offer = offer
        # It is possible that the email from when the offer was created is stale,
        # so send the offer to the applicant's current email.
        @email = offer.assignment.applicant.email
        @first_name = offer.first_name
        @last_name = offer.last_name
        @position_code = offer.position_code
        @hours = offer.hours
        @position_title = offer.position_title
        @ta_coordinator_email = offer.ta_coordinator_email
        # TODO:  This seems too hard-coded.  Is there another way to get the route?
        @url =
            "#{Rails.application.config.base_url}/public/contracts/#{
                offer.url_token
            }/view"
        @nag_count = offer.nag_count
        @status_message = offer.set_status_message
        prev_offer_diff
    end
end
