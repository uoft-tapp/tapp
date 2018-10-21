# frozen_string_literal: true

require 'rails_helper'

describe Applicant do
  it 'should not be valid without a first name' do
    k = FactoryBot.build(:applicant, first_name: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without last name' do
    k = FactoryBot.build(:applicant, last_name: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without email' do
    k = FactoryBot.build(:applicant, email: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without student number' do
    k = FactoryBot.build(:applicant, student_number: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without utorid' do
    k = FactoryBot.build(:applicant, utorid: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if the student number is already taken' do
    applicant1 = FactoryBot.create(:applicant)
    applicant2 = FactoryBot.build(:applicant, student_number: applicant1.student_number)

    expect(applicant2).to_not be_valid
    expect { applicant2.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if the utorid is already taken' do
    applicant1 = FactoryBot.create(:applicant)
    applicant2 = FactoryBot.build(:applicant, utorid: applicant1.utorid)

    expect(applicant2).to_not be_valid
    expect { applicant2.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: applicants
#
#  id              :bigint(8)        not null, primary key
#  address         :text
#  commentary      :text
#  dept            :string
#  email           :string
#  first_name      :string
#  is_full_time    :boolean
#  is_grad_student :boolean
#  last_name       :string
#  phone           :string
#  student_number  :string
#  utorid          :string
#  year_in_program :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
