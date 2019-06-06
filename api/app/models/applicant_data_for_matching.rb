# frozen_string_literal: true


# A class representing the matching portion of an applicant's data.
class ApplicantDataForMatching < ApplicationRecord
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
#
