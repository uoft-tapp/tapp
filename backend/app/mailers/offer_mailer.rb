# frozen_string_literal: true

class OfferMailer < ApplicationMailer
    # default from comes from config environment
    layout 'mailer'

    def contract_email(assignment, link)
        @offer = assignment.active_offer
        @url = link
        mail(to: assignment.applicant.email, subject: 'hi there')
    end
end
