# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PositionDataForAd, type: :model do
    describe 'associations' do
        it { should belong_to(:position) }
    end

    describe 'validations' do
        it { should validate_numericality_of(:ad_num_assignments) }
        it { should validate_numericality_of(:ad_hours_per_assignment) }
    end
end

# == Schema Information
#
# Table name: position_data_for_ads
#
#  id                      :integer          not null, primary key
#  position_id             :integer          not null
#  duties                  :text
#  qualifications          :text
#  ad_hours_per_assignment :float
#  ad_num_assignments      :integer
#  ad_open_date            :datetime
#  ad_close_date           :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_position_data_for_ads_on_position_id  (position_id)
#
