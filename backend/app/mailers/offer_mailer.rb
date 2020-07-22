class OfferMailer < ApplicationMailer
  default from: ENV['EMAIL_USER']
  layout 'mailer'

  def contract_email(offer, link)
    puts("HERE")
    @offer = offer
    @url = link
    puts("In contract_email")
    mail(to: ENV['RECIPIENT'], subject: 'hi there')
    
  end

end