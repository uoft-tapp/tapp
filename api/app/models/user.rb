# frozen_string_literal: true

# A class representing a user. This holds information regarding known users and their roles
# to determine what they should be allowed access to.
class User < ApplicationRecord
  enum role: %i[admin instructor]
  validates :role, numericality: true, allow_nil: true
  validates_presence_of :utorid
  validates_uniqueness_of :utorid
end

# == Schema Information
#
# Table name: users
#
#  id         :bigint(8)        not null, primary key
#  role       :integer
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
