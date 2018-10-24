# frozen_string_literal: true

require 'rails_helper'

describe Preference do
  it 'has a valid factory' do
    FactoryBot.create(:preference, :high)
    FactoryBot.create(:preference, :low)
    FactoryBot.create(:preference, :medium)
  end

  it 'should not save without a priority' do
    k = FactoryBot.build(:preference, priority: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save without a position' do
    k = FactoryBot.build(:preference, :high, position: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save without an applicant' do
    k = FactoryBot.build(:preference, :high, applicant: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save with a non-integer priority' do
    k = FactoryBot.build(:preference, priority: 3.123)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save with a negative priority' do
    k = FactoryBot.build(:preference, priority: -3)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: preferences
#
#  id           :bigint(8)        not null, primary key
#  priority     :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  applicant_id :bigint(8)
#  position_id  :bigint(8)
#
# Indexes
#
#  index_preferences_on_applicant_id  (applicant_id)
#  index_preferences_on_position_id   (position_id)
#
