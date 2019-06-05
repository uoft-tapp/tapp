# frozen_string_literal: true


# A class representing a reporting tag for tables such as 
# 	wage_chunk and position.
class ReportingTag < ApplicationRecord
	belongs_to :wage_chunk
	belongs_to :position
end

# == Schema Information
#
# Table name: reporting_tags
#
#  id            :bigint(8)        not null, primary key
#  name          :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  position_id   :bigint(8)
#  wage_chunk_id :bigint(8)
#
# Indexes
#
#  index_reporting_tags_on_position_id    (position_id)
#  index_reporting_tags_on_wage_chunk_id  (wage_chunk_id)
#
