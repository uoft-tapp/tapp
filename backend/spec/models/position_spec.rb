# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Position, type: :model do
    describe 'associations' do
        it { should have_and_belong_to_many(:instructors) }
        it { should have_and_belong_to_many(:reporting_tags) }
        it { should have_many(:assignments) }
        it { should have_many(:position_preferences) }
        it { should have_many(:applications).through(:position_preferences) }
        it { should have_one(:position_data_for_matching) }
        it { should belong_to(:session) }
        it { should belong_to(:contract_template) }
    end

    describe 'validation' do
        it { should validate_presence_of(:start_date) }
        it { should validate_presence_of(:end_date) }
        it { should validate_presence_of(:position_code) }
        it { should validate_numericality_of(:hours_per_assignment) }
    end
end

# == Schema Information
#
# Table name: positions
#
#  id                   :integer          not null, primary key
#  session_id           :integer          not null
#  position_code        :string
#  position_title       :string
#  hours_per_assignment :float
#  start_date           :datetime
#  end_date             :datetime
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  contract_template_id :integer          not null
#
# Indexes
#
#  index_positions_on_contract_template_id  (contract_template_id)
#  index_positions_on_session_id            (session_id)
#
