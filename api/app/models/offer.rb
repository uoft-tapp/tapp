# frozen_string_literal: true

# A class representing an offer. This class belongs to assignment, applicant and position.
class Offer < ApplicationRecord
  belongs_to :assignments
  belongs_to :applicants
  belongs_to :positions
end

# == Schema Information
#
# Table name: offers
#
#  id            :bigint(8)        not null, primary key
#  end_date      :date
#  hours         :integer
#  pay1          :float
#  pay2          :float
#  start_date    :date
#  status        :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  applicant_id  :bigint(8)
#  assignment_id :bigint(8)
#  position_id   :bigint(8)
#
# Indexes
#
#  index_offers_on_applicant_id   (applicant_id)
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_position_id    (position_id)
#
