# frozen_string_literal: true

require 'rails_helper'

describe Session do
  it 'should have a valid factory' do
    FactoryBot.create(:session, :winter)
    FactoryBot.create(:session, :fall)
    FactoryBot.create(:session, :summer)
  end

  it 'should not be valid without a semester' do
    k = FactoryBot.build(:session, :fall, semester: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid without a year' do
    k = FactoryBot.build(:session, :fall, year: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if we have the two session with the same year and semester' do
    FactoryBot.create(:session, :fall)
    k = FactoryBot.build(:session, :fall)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if we have a semester not in the given values' do
    k = FactoryBot.build(:session, :fall, semester: 40)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if we have a year less than 0' do
    k = FactoryBot.build(:session, :fall, year: -23)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if we do not have an integer for year' do
    k = FactoryBot.build(:session, :fall, year: 2018.1234)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end
