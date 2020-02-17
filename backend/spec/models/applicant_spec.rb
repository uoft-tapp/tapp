# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Applicant, type: :model do
    describe 'associations' do
        it { should have_many(:assignments) }
        it { should have_many(:applications) }
        it { should have_one(:applicant_data_for_matching) }
    end

    describe 'validations' do
        it { should validate_presence_of(:first_name) }
        it { should validate_presence_of(:last_name) }
        it { should validate_presence_of(:email) }
        it { should validate_presence_of(:student_number) }
        it { should validate_presence_of(:utorid) }
    end

    describe 'student number uniqueness validation' do
        subject { build(:applicant, :with_student_number, :with_utorid) }
        it { should validate_uniqueness_of(:student_number).case_insensitive }
    end

    describe 'utorid uniqueness validation' do
        subject { build(:applicant, :with_student_number) }
        it { should validate_uniqueness_of(:utorid) }
    end
end

# == Schema Information
#
# Table name: applicants
#
#  id             :integer          not null, primary key
#  utorid         :string           not null
#  student_number :string           not null
#  first_name     :string           not null
#  last_name      :string           not null
#  email          :string           not null
#  phone          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
