class OfferMailerJob < ApplicationJob
  queue_as :default

  def perform(offer_id, nag)
    if nag
      OfferMailer.with(offer_id: offer_id).contract_email.deliver_now
    else
      OfferMailer.with(offer_id: offer_id).nag_email.deliver_now
    end
  end
end
