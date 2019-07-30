# frozen_string_literal: true

describe Instructor do
  it 'should create a valid instructor object' do
    FactoryBot.create(:instructor)
    FactoryBot.create(:instructor_with_positions)
  end

  it 'should not be valid without a first name' do
    skip "To do"
    k = FactoryBot.build(:instructor, first_name: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without a last name' do
    skip "To do"
    k = FactoryBot.build(:instructor, last_name: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without a utorid' do
    skip "To do"
    k = FactoryBot.build(:instructor, utorid: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without an email' do
    skip "To do"
    k = FactoryBot.build(:instructor, email: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if the utorid is already taken' do
    skip "To do"
    instructor1 = FactoryBot.create(:instructor)
    instructor2 = FactoryBot.build(:instructor, utorid: instructor1.utorid)

    expect(instructor2).to_not be_valid
    expect { instructor2.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: instructors
#
#  id         :bigint(8)        not null, primary key
#  email      :string           not null
#  first_name :string           not null
#  last_name  :string           not null
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_instructors_on_utorid  (utorid) UNIQUE
#
