# frozen_string_literal: true

# A class representing a reporting tag for tables such as
# wage_chunk and position.
class ReportingTag < ApplicationRecord
    has_and_belongs_to_many :wage_chunks
    has_and_belongs_to_many :positions

    scope :position_reporting_tags_by_session,
          lambda { |session_id|
              joins(:positions)
                  .where(positions: { session_id: session_id })
                  .distinct
          }

    scope :wage_chunk_reporting_tags_by_session,
          lambda { |session_id|
              joins(wage_chunks: { assignment: :position })
                  .where(positions: { session_id: session_id })
                  .distinct
          }
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
