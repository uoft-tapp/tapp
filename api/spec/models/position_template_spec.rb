# frozen_string_literal: true

describe PositionTemplate do
  it 'should have a valid factory' do
    # Note that to create a session with correct fields (IE non
    # empty), we should use the following pattern:
    session = FactoryBot.create(:session, :fall)
    a = FactoryBot.create(:position_template, session: session)
  end
end
