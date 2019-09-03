# frozen_string_literal: true

# Mailer class for rendering emails related to offers
class OfferMailer < ApplicationMailer
    def contract_email
        @offer = params[:offer]
        @url = ENV['BASE_URL'] + "/offers/#{@offer.url_token}"
        subject = "TA Position Offer: #{@offer.position_code}"
        mail(to: @offer.email, subject: subject)
        @offer.update_attribute(:emailed_date, Time.zone.now)
    end

    def nag_email
        @offer = params[:offer]
        @url = ENV['BASE_URL'] + "/offers/#{@offer.url_token}"
        subject = "TA Position Offer: #{@offer.position_code}"
        mail(to: @offer.email, subject: subject)
        @offer.update_attribute(:nag_count, @offer.nag_count + 1)
    end
end
