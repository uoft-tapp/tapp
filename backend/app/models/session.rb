# frozen_string_literal: true

# A class representing a school term. For example, "fall 2018".
class Session < ApplicationRecord
    has_many :applications
    has_many :contract_templates
    has_many :positions

    validates :rate1, numericality: { only_float: true }, allow_nil: true
    validates :rate2, numericality: { only_float: true }, allow_nil: true
    validates :name, presence: true
    validates_uniqueness_of :name
end

# == Schema Information
#
# Table name: sessions
#
#  id         :integer          not null, primary key
#  start_date :datetime
#  end_date   :datetime
#  name       :string
#  rate1      :float
#  rate2      :float
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
