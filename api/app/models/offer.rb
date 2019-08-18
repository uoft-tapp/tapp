# frozen_string_literal: true

# A class representing an offer. This class belongs to assignment, applicant and position.
class Offer < ApplicationRecord
		belongs_to :assignment
		after_save :set_assignment_active_offer 

		private
			def set_assignment_active_offer
				self.assignment.update_attribute(:active_offer_id, self.id)
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
