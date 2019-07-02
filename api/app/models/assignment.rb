# frozen_string_literal: true

# A class representing an assignment. This class has many offers and belongs to 
# applicant and position.
class Assignment < ApplicationRecord
  	has_many :offers
  	belongs_to :applicant
  	belongs_to :position
  	has_many :wage_chunks

  	validates_uniqueness_of :applicant_id, :scope => [:position_id]
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
#  applicant_id       :bigint(8)
#  position_id        :bigint(8)
#
# Indexes
#
#  index_assignments_on_applicant_id                  (applicant_id)
#  index_assignments_on_position_id                   (position_id)
#  index_assignments_on_position_id_and_applicant_id  (position_id,applicant_id) UNIQUE
#
