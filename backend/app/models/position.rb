# frozen_string_literal: true

class Position < ApplicationRecord
    has_and_belongs_to_many :instructors
    has_and_belongs_to_many :reporting_tags
    has_many :assignments, dependent: :destroy
    has_many :position_preferences, dependent: :destroy
    has_many :applications, through: :position_preferences
    belongs_to :session
    belongs_to :contract_template

    validates :hours_per_assignment,
              numericality: { only_float: true }, allow_nil: true
    validates :position_code, presence: true, uniqueness: { scope: :session }

    def start_date
        # If we have a non-null date, return that. Otherwise
        # we return the date from the session
        return self[:start_date] if self[:start_date]

        session.start_date
    end

    def end_date
        # If we have a non-null date, return that. Otherwise
        # we return the date from the session
        return self[:end_date] if self[:end_date]

        session.end_date
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
