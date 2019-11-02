# frozen_string_literal: true

# A class representing an offer. This class belongs to assignment, applicant and position.
class Offer < ApplicationRecord
    has_secure_token :url_token
    enum status: %i[pending accepted rejected]

    belongs_to :assignment
    after_create :set_assignment_active_offer

    validates_presence_of :status

    def format
        offer = as_json
        position = assignment.position
        applicant = assignment.applicant
        data = {
            position: position.position_code,
            hours: position.est_hours_per_assignment,
            start_date: assignment.contract_start,
            end_date: assignment.contract_end,
            applicant: applicant.as_json,
            # FIXME: What to do with this since chunks are variable
            session_info: {
                pay: '$' + assignment.wage_chunks.last&.rate&.to_s || ''
            }
        }
        # the Liquid templating engine assumes strings instead of symbols
        offer.merge!(data).with_indifferent_access
    end

    private

    def set_assignment_active_offer
        # update_column skips callbacks
        assignment.update_column(:active_offer_id, id)
    end
end
# Below are the only fields that are updatable:
#
# accepted_date
# emailed_date
# nag_count
# rejected_date
# signature
# withdrawn_date
# updated_at

# == Schema Information
#
# Table name: offers
#
#  id                      :bigint(8)        not null, primary key
#  accepted_date           :datetime
#  email                   :string
#  emailed_date            :datetime
#  first_name              :string
#  first_time_ta           :boolean
#  installments            :integer
#  instructor_contact_desc :string
#  last_name               :string
#  nag_count               :integer          default(0)
#  offer_override_pdf      :string
#  offer_template          :string
#  pay_period_desc         :string
#  position_code           :string
#  position_end_date       :datetime
#  position_start_date     :datetime
#  position_title          :string
#  rejected_date           :datetime
#  signature               :string
#  ta_coordinator_email    :string
#  ta_coordinator_name     :string
#  url_token               :string
#  withdrawn_date          :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  assignment_id           :bigint(8)
#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token) UNIQUE
#
