# frozen_string_literal: true

class OfferMailer < ApplicationMailer
    # default from comes from config environment
    layout 'mailer'

    def email_contract(offer)
        generate_vars(offer)
        mail(
            to: @email,
            from: @ta_coordinator_email,
            subject: "TA Position Offer for #{@position_code}"
        )
    end

    def email_nag(offer)
        generate_vars(offer)
        mail(
            to: @email,
            from: @ta_coordinator_email,
            subject:
                "Reminder #{@nag_count}: TA Position Offer for #{
                    @position_code
                }"
        )
    end

    private

    def generate_vars(offer)
        @offer = offer
        @email = offer.email
        @first_name = offer.first_name
        @last_name = offer.last_name
        @position_code = offer.position_code
        @position_title = offer.position_title
        @ta_coordinator_email = offer.ta_coordinator_email
        # TODO:  This seems too hard-coded.  Is there another way to get the route?
        @url =
            "#{Rails.application.config.base_url}/public/contracts/#{
                offer.url_token
            }/view"
        @nag_count = offer.nag_count
    end
end
