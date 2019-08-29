# frozen_string_literal: true

# A class representing an offer. This class belongs to assignment, applicant and position.
require 'json'
class Offer < ApplicationRecord
  	belongs_to :assignment


    def get_deadline
      offer = self.as_json
      if offer[:send_date]
        DateTime.parse(offer[:send_date]).days_ago(-21)
      end
    end

    def format
      offer = self.as_json

      #These will be removed once I figure out the rate.
      assignment = Assignment.find(offer["assignment_id"]).as_json
      position = Position.find(assignment["position_id"]).as_json
      applicant = Applicant.find(assignment["applicant_id"])
      session = Session.find(position["session_id"])
      if offer[:link]
        offer[:link]= "#{ENV["domain"]}#{offer[:link]}"
      end
      data = {
        position: offer["position_code"],
        start_date: offer["position_start_date" ],
        end_date: offer["position_end_date"],
        hours: offer["pay_period_desc"],
        first_name: offer["first_name"],
        last_name: offer["last_name"],
        session: session,
        session_info: session.format,
        deadline: self.get_deadline,
      }
      if offer[:send_date]
        data[:deadline] = self.get_deadline
      end
      # the Liquid templating engine assumes strings instead of symbols
      return offer.merge(data).with_indifferent_access
    end

    def instructor_format
      offer = self.as_json

      assignment = Assignment.find(offer["assignment_id"]).as_json
      position = Position.find(assignment["position_id"]).as_json
      applicant = Applicant.find(assignment["applicant_id"])

      data = {
        position: position["position_title"],
        applicant: applicant.format,
      }
      excludes = [
        :accept_date,
        :commentary,
        :hr_status,
        :link,
        :nag_count,
        :print_time,
        :send_date,
        :signature,
        :year,
        :session,
      ]
      # the Liquid templating engine assumes strings instead of symbols
      return offer.merge(data).except(*excludes).with_indifferent_access
    end

    private
    def randomize_id
      begin
        self.id = SecureRandom.random_number(1_000_000_000)
      end while Offer.where(id: self.id).exists?
    end
  end

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
#  withdrawn_date          :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  assignment_id           :bigint(8)
#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#
