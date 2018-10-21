# frozen_string_literal: true

require 'rails_helper'

describe Instructor do
  it 'should not be valid without a first name' do
    k = FactoryBot.build(:instructor, first_name: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without a last name' do
    k = FactoryBot.build(:instructor, last_name: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without a utorid' do
    k = FactoryBot.build(:instructor, utorid: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without an email' do
    k = FactoryBot.build(:instructor, email: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if the utorid is already taken' do
    instructor1 = FactoryBot.create(:instructor)
    instructor2 = FactoryBot.build(:instructor, utorid: instructor1.utorid)

    expect(instructor2).to_not be_valid
    expect { instructor2.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end
