# frozen_string_literal: true

# A class representing an offer. This class belongs to assignment, applicant and position.
class Offer < ApplicationRecord
  belongs_to :assignment
  belongs_to :applicant
  belongs_to :position
end

# == Schema Information
#
# Table name: offers
#
#  id             :bigint(8)        not null, primary key
#  end_date       :date
#  hours          :integer
#  pay1           :float
#  pay2           :float
#  start_date     :date
#  status         :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  applicants_id  :bigint(8)
#  assignments_id :bigint(8)
#  positions_id   :bigint(8)
#
# Indexes
#
#  index_offers_on_applicants_id   (applicants_id)
#  index_offers_on_assignments_id  (assignments_id)
#  index_offers_on_positions_id    (positions_id)
#
