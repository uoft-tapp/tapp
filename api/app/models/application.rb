# frozen_string_literal: true

# A class representing an application of an applicant.
class Application < ApplicationRecord
	belongs_to :session
	has_many :position_preferences
  	has_many :positions, through: :position_preferences
end

# == Schema Information
#
# Table name: applications
#
#  id         :bigint(8)        not null, primary key
#  comments   :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  session_id :bigint(8)
#
# Indexes
#
#  index_applications_on_session_id  (session_id)
#
