# frozen_string_literal: true


# A class representing the matching portion of an applicant's data.
class ApplicantDataForMatching < ApplicationRecord
	belongs_to :applicant
	belongs_to :application
	validates :yip, numericality: true, allow_nil: true
end

# == Schema Information
#
# Table name: applicant_data_for_matchings
#
#  id                          :bigint(8)        not null, primary key
#  annotation                  :string
#  department                  :string
#  previous_uoft_ta_experience :text
#  program                     :string
#  yip                         :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  applicant_id                :bigint(8)
#  application_id              :bigint(8)
#
# Indexes
#
#  index_applicant_data_for_matchings_on_applicant_id    (applicant_id)
#  index_applicant_data_for_matchings_on_application_id  (application_id)
#
