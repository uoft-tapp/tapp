class OfferMailer < ApplicationMailer
  # default from comes from config environment
  layout 'mailer'

  def contract_email(assignment, link)
    @offer = assignment.active_offer
    @url = link
    puts("In contract_email")
    mail(to: assignment.applicant.email, subject: 'hi there')
    
  end

end