# frozen_string_literal: true

# A class representing a position template, which represents the
#   location of the template associated with a position contract.
class PositionTemplate < ApplicationRecord
    belongs_to :session
end

# == Schema Information
#
# Table name: position_templates
#
#  id             :bigint(8)        not null, primary key
#  offer_template :string
#  position_type  :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  session_id     :bigint(8)
#
# Indexes
#
#  index_position_templates_on_session_id  (session_id)
#
