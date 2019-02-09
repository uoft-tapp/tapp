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

  it 'should not save without a round' do
    k = FactoryBot.build(:position, round: nil)
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
    new.round = original.round

    expect(new).to_not be_valid
    expect { new.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: positions
#
#  id                :bigint(8)        not null, primary key
#  cap_enrolment     :integer
#  course_code       :string
#  course_name       :text
#  current_enrolment :integer
#  duties            :text
#  end_date          :datetime
#  hours             :integer
#  num_waitlisted    :integer
#  openings          :integer
#  qualifications    :text
#  start_date        :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  round_id          :bigint(8)
#  session_id        :bigint(8)
#
# Indexes
#
#  index_positions_on_course_code_and_round_id  (course_code,round_id) UNIQUE
#  index_positions_on_round_id                  (round_id)
#  index_positions_on_session_id                (session_id)
#
