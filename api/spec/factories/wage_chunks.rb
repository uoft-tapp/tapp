# frozen_string_literal: true

FactoryBot.define do
    factory :wage_chunk do
        assignment { nil }
        hours { 1.5 }
        rate { 1.5 }
        start_date { '2019-11-10 15:20:37' }
        end_date { '2019-11-10 15:20:37' }
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
