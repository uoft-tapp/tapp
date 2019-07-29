# frozen_string_literal: true

describe Application do
  it 'should have a valid factory' do
    session = FactoryBot.create(:session, :fall)
    a = FactoryBot.create(:application, session: session)
  end

  it 'should never save without ApplicantDataForMatching' do
    skip "To do"
  end
end
