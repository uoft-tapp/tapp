# frozen_string_literal: true

require 'rails_helper'

describe Round do
  it 'should have a valid factory' do
    k = FactoryBot.create(:round, :fall)
    k.start_date = Time.new(k.session.year, 9)
    k.end_date = Time.new(k.session.year, 12, 31)
    k.save!
    FactoryBot.create(:round, :winter)
    FactoryBot.create(:round, :summer)
  end

  it 'should not save without a number' do
    k = FactoryBot.build(:round, :fall, number: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save without a valid number' do
    k = FactoryBot.build(:round, :fall, number: -23)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: rounds
#
#  id         :bigint(8)        not null, primary key
#  end_date   :datetime
#  number     :integer
#  start_date :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  session_id :bigint(8)
#
# Indexes
#
#  index_rounds_on_session_id  (session_id)
#
