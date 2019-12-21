# frozen_string_literal: true

# A class representing a user. This holds information regarding known users and their roles
# to determine what they should be allowed access to.
class User < ApplicationRecord
    validates_presence_of :utorid
    validates_uniqueness_of :utorid
end

# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  utorid     :string
#  role       :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
