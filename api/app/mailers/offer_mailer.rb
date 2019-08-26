class OfferMailer < ApplicationMailer
    def contract_email
        @offer = params[:offer]
        @url = "test url"
        subject = "TA Position Offer: #{@offer.position_code}"
        mail(to: @offer.email, subject: subject)
    end

    def nag_email
        @offer = params[:offer]
        @url = "test url"
        subject = "TA Position Offer: #{@offer.position_code}"
        mail(to: @offer.email, subject: subject)
    end
end
