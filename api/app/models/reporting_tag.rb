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
#  id         :bigint(8)        not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
