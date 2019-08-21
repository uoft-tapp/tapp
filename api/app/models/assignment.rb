# frozen_string_literal: true

# A class representing an assignment. This class has many offers and belongs to
# applicant and position.
class Assignment < ApplicationRecord
	has_many :offers
	has_one :active_offer
  	belongs_to :applicant
  	belongs_to :position
  	has_many :wage_chunks

	validates_uniqueness_of :applicant_id, :scope => [:position_id]

	before_save :check_active_offer_status
	after_save :rest_active_offer 

	def active_offer
		self.active_offer_id ? Offer.find(self.active_offer_id) : nil
	end 

	def withdraw_active_offer
		return if self.active_offer.blank? 

		self.active_offer.update_attribute(:withdrawn_date, Time.zone.now)
	end

	def create_offer
		return if self.active_offer.present? 

		applicant = self.applicant
		position = self.position 
		instructors = position.instructors 
		session = position.session

		offer = Offer.new({
			email: applicant.email,
			first_name: applicant.first_name,
			last_name: applicant.last_name,
		})
	end 
	
	private

		def check_active_offer_status
			return false if self.active_offer && self.active_offer.withdrawn_date.blank? 
		end

		def reset_active_offer
			self.update_attribute(:active_offer_id, nil)
		end
end

# == Schema Information
#
# Table name: assignments
#
#  id                 :bigint(8)        not null, primary key
#  contract_end       :datetime
#  contract_start     :datetime
#  note               :text
#  offer_override_pdf :string
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  active_offer_id    :bigint(8)
#  applicant_id       :bigint(8)
#  position_id        :bigint(8)
#
# Indexes
#
#  index_assignments_on_active_offer_id               (active_offer_id)
#  index_assignments_on_applicant_id                  (applicant_id)
#  index_assignments_on_position_id                   (position_id)
#  index_assignments_on_position_id_and_applicant_id  (position_id,applicant_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (active_offer_id => offers.id)
#
