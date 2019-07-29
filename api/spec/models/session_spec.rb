# frozen_string_literal: true

describe Session do
  it 'should have a valid factory' do
    FactoryBot.create(:session, :fall)
    FactoryBot.create(:session, :winter)
    FactoryBot.create(:session, :summer)
  end

  it 'should not be valid with the same name' do
    skip "To do"
  end

  it 'should have only float rates' do
    skip "To do"
  end

# == Schema Information
#
# Table name: sessions
#
#  id         :bigint(8)        not null, primary key
#  end_date   :datetime
#  name       :string
#  rate1      :float
#  rate2      :float
#  start_date :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
