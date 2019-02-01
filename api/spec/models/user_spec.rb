# frozen_string_literal: true

describe User do
  it 'should create a valid user object' do
    k = FactoryBot.create(:user)
    expect(k).to eq(User.last)
  end

  context 'role is instructor' do
    it 'should create a valid user object' do
      k = FactoryBot.create(:user, :instructor)
      expect(k).to eq(User.last)
    end
  end

  context 'role is admin' do
    it 'should create a valid user object' do
      k = FactoryBot.create(:user, :admin)
      expect(k).to eq(User.last)
    end
  end

  context 'role is invalid' do
    it 'should not be valid' do
      expect { FactoryBot.create(:user, role: 3) }.to raise_error(ArgumentError)
    end
  end

  it 'should not be valid without a utorid' do
    k = FactoryBot.build(:user, utorid: nil)
    expect(k).to_not be_valid

    expect { k.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it 'should not be valid if the utorid is already taken' do
    user1 = FactoryBot.create(:user)
    user2 = FactoryBot.build(:user, utorid: user1.utorid)

    expect(user2).to_not be_valid
    expect { user2.save! }.to raise_error(ActiveRecord::RecordInvalid)
  end
end

# == Schema Information
#
# Table name: users
#
#  id         :bigint(8)        not null, primary key
#  role       :integer
#  utorid     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
