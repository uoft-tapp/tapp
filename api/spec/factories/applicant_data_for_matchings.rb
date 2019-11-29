# frozen_string_literal: true

FactoryBot.define do
    factory :applicant_data_for_matching do
        applicant { nil }
        application { nil }
        program { 'MyString' }
        department { 'MyString' }
        previous_uoft_ta_experience { 'MyText' }
        yip { 1 }
        annotation { 'MyString' }
    end
end

# == Schema Information
#
# Table name: applicant_data_for_matchings
#
#  id                       :integer          not null, primary key
#  applicant_id             :integer          not null
#  application_id           :integer          not null
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
#  index_applicant_data_for_matchings_on_applicant_id    (applicant_id)
#  index_applicant_data_for_matchings_on_application_id  (application_id)
#
