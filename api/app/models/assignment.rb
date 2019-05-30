# frozen_string_literal: true

# A class representing an assignment. This class has many offers and belongs to 
# applicant and position.
class Assignment < ApplicationRecord
  has_many :offers
  belongs_to :applicant
  belongs_to :position

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
#
