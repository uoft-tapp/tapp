# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicantDataForMatching, type: :model do
    describe 'associations' do
        it { should belong_to(:applicant) }
    end

    describe 'validations' do
        it { should validate_numericality_of(:yip).allow_nil }
    end
end

# == Schema Information
#
# Table name: applicant_data_for_matchings
#
#  id                       :integer          not null, primary key
#  applicant_id             :integer          not null
#  program                  :string
#  department               :string
#  previous_uoft_experience :text
#  yip                      :integer
#  annotation               :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  index_applicant_data_for_matchings_on_applicant_id  (applicant_id)
#
