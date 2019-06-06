# frozen_string_literal: true

# A class representing an offer. This class belongs to assignment, applicant and position.
class Offer < ApplicationRecord
  belongs_to :assignment
end

# == Schema Information
#
# Table name: offers
#
#  id            :bigint(8)        not null, primary key
#  end_date      :date
#  hours         :integer
#  start_date    :date
#  status        :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assignment_id :bigint(8)
#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#
