# frozen_string_literal: true

describe Offer do
  it 'should have a valid factory' do
    a = FactoryBot.create(:offer, :accepted)
  end
end

