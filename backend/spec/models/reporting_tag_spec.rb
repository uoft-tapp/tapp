# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportingTag, type: :model do
    describe 'associations' do
        it { should have_and_belong_to_many(:wage_chunks) }
        it { should have_and_belong_to_many(:positions) }
    end
end

# == Schema Information
#
# Table name: reporting_tags
#
#  id            :integer          not null, primary key
#  position_id   :integer
#  wage_chunk_id :integer
#  name          :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_reporting_tags_on_position_id    (position_id)
#  index_reporting_tags_on_wage_chunk_id  (wage_chunk_id)
#
