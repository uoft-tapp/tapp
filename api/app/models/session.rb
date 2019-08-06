# frozen_string_literal: true

# A class representing a school term. For example, "fall 2018".
class Session < ApplicationRecord
  has_many :positions
  has_many :position_templates
  has_many :applications

  validates :rate1, numericality: { only_float: true }, allow_nil: true
  validates :rate2, numericality: { only_float: true }, allow_nil: true
  validates_uniqueness_of :name
end

# == Schema Information
#
# Table name: sessions
#
#  id         :bigint(8)        not null, primary key
#  end_date   :datetime
#  name       :string
#  rate1      :float
#  rate2      :float
#  start_date :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
