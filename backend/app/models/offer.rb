# frozen_string_literal: true

class Offer < ApplicationRecord
    OFFER_STATUS = %i[provisional pending accepted rejected withdrawn].freeze
    belongs_to :assignment

    has_secure_token :url_token
    enum status: OFFER_STATUS

    scope :withdraw_all,
          -> { update_all(status: :withdrawn, withdrawn_date: Time.zone.now) }

    before_create :populate_offer
    before_update :set_status_date

    # Can an applicant accept this offer?
    def can_accept?
        !accepted? && !rejected? && !withdrawn?
    end

    # Can an applicant reject this offer?
    def can_reject?
        !accepted? && !rejected? && !withdrawn?
    end

    def set_status_message
        case status.to_sym
        when :pending
            'You have not responded to this offer'
        end
    end

    def diff(other)
        check = ['hours', "position_start_date", "position_end_date"]
        diff = Hash.new
        check.each do |k|
            diff[k] = other[k] if other[k] != self[k]
        end
        return diff
    end

    private

    def populate_offer
        applicant_attrs = %i[first_name last_name email]
        position_attrs = %i[position_code position_title]

        applicant = assignment.applicant
        position = assignment.position

        # inherit attributes defined from the applicant and the position
        self.attributes =
            attributes.merge(
                applicant.as_json(only: applicant_attrs),
                position.as_json(only: position_attrs)
            )
        # define the computed attributes
        self.hours = assignment.hours
        self.instructor_contact_desc =
            position.instructors.map(&:contact_info).to_sentence
        self.contract_template = position.contract_template.template_file
        self.contract_override_pdf = assignment.contract_override_pdf
        formatting_service =
            WageChunkFormattingService.new(assignment: assignment)
        self.pay_period_desc = formatting_service.pay_period_description
        self.position_start_date = position.start_date
        self.position_end_date = position.end_date
        self.ta_coordinator_email =
            Rails.application.config.ta_coordinator_email
        self.ta_coordinator_name = Rails.application.config.ta_coordinator_name
    end

    def set_status_date
        if status_changed?
            case status.to_sym
            when :accepted
                self.accepted_date = Time.zone.now
            when :rejected
                self.rejected_date = Time.zone.now
            when :withdrawn
                self.withdrawn_date = Time.zone.now
            when :pending
                self.emailed_date = Time.zone.now
            end
        end
    end
end
# == Schema Information
#
# Table name: offers
#
#  id                      :integer          not null, primary key
#  assignment_id           :integer          not null
#  contract_template       :string
#  contract_override_pdf   :string
#  first_name              :string
#  last_name               :string
#  email                   :string
#  position_code           :string
#  position_title          :string
#  position_start_date     :datetime
#  position_end_date       :datetime
#  first_time_ta           :boolean
#  instructor_contact_desc :string
#  pay_period_desc         :string
#  hours                   :float
#  installments            :integer
#  ta_coordinator_name     :string
#  ta_coordinator_email    :string
#  emailed_date            :datetime
#  signature               :string
#  accepted_date           :datetime
#  rejected_date           :datetime
#  withdrawn_date          :datetime
#  nag_count               :integer          default("0")
#  url_token               :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  status                  :integer          default("0"), not null
#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token)
#

#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token)
#
