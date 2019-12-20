# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WageChunk, type: :model do
    describe 'associations' do
        it { should have_and_belong_to_many(:reporting_tags) }
        it { should belong_to(:assignment) }
    end

    describe 'validations' do
        it { should validate_numericality_of(:hours) }
        it { should validate_numericality_of(:rate) }
    end
end

# == Schema Information
#
# Table name: wage_chunks
#
#  id            :integer          not null, primary key
#  assignment_id :integer          not null
#  hours         :float
#  rate          :float
#  start_date    :datetime
#  end_date      :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_wage_chunks_on_assignment_id  (assignment_id)
#
