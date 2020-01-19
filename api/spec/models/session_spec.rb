# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Session, type: :model do
    describe 'associations' do
        it { should have_many(:applications) }
        it { should have_many(:contract_templates) }
        it { should have_many(:positions) }
    end

    describe 'validations' do
        it { should validate_numericality_of(:rate1) }
        it { should validate_numericality_of(:rate2) }
        it { should validate_uniqueness_of(:name) }
    end
end

# == Schema Information
#
# Table name: sessions
#
#  id         :integer          not null, primary key
#  start_date :datetime
#  end_date   :datetime
#  name       :string
#  rate1      :float
#  rate2      :float
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
