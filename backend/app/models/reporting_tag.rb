# frozen_string_literal: true

# A class representing a reporting tag for tables such as
# wage_chunk and position.
class ReportingTag < ApplicationRecord
    has_and_belongs_to_many :wage_chunks
    has_and_belongs_to_many :positions
end

# == Schema Information
#
# Table name: reporting_tags
#
#  id            :integer          not null, primary key
#  position_id   :integer          not null
#  wage_chunk_id :integer          not null
#  name          :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_reporting_tags_on_position_id    (position_id)
#  index_reporting_tags_on_wage_chunk_id  (wage_chunk_id)
#
