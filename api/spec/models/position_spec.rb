# frozen_string_literal: true

describe Position do
  it 'should have a valid factory' do
    FactoryBot.create(:position)
  end

  it 'should not save without course code' do
    k = FactoryBot.build(:position, course_code: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save without openings' do
    k = FactoryBot.build(:position, openings: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save without a session' do
    k = FactoryBot.build(:position, session: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save with invalid openings' do
    k = FactoryBot.build(:position, openings: -30.15)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not save with a duplicated opening date' do
    original = FactoryBot.create(:position)
    new = FactoryBot.build(:position)
    new.session = original.session

    expect(new).to_not be_valid
    expect { new.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: positions
#
#  id         :bigint(8)        not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  session_id :bigint(8)
#
# Indexes
#
#  index_positions_on_session_id  (session_id)
#
# Foreign Keys
#
#  fk_rails_...  (session_id => sessions.id)
#
