# frozen_string_literal: true

class Ddah < ApplicationRecord
    DDAH_STATUS = %i[preliminary pending accepted approved].freeze
    belongs_to :assignment
    has_many :duties, dependent: :destroy
    accepts_nested_attributes_for :duties

    has_secure_token :url_token
    enum status: DDAH_STATUS

    scope :by_session,
          lambda { |session_id|
              joins(assignment: :position).where(
                  positions: { session_id: session_id }
              )
          }

    def accept
        self.accepted_date = Time.zone.now
    end

    def approve
        self.approved_date = Time.zone.now
    end

    def email
        self.emailed_date = Time.zone.now
    end

    private

    def set_status_date
        if status_changed?
            case status.to_sym
            when :accepted
                self.accepted_date = Time.zone.now
            when :approved
                self.approved_date = Time.zone.now
            when :pending
                self.emailed_date = Time.zone.now
            end
        end
    end
end
# == Schema Information
#
# Table name: ddahs
#
#  id            :integer          not null, primary key
#  assignment_id :integer          not null
#  approved_date :datetime
#  accepted_date :datetime
#  revised_date  :datetime
#  emailed_date  :datetime
#  signature     :string
#  url_token     :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_ddahs_on_assignment_id  (assignment_id)
#  index_ddahs_on_url_token      (url_token)
#

#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token)
#
