# frozen_string_literal: true

require 'rubygems'
require 'role_model'

# A class representing a user. This holds information regarding known users and their roles
# to determine what they should be allowed access to.
class User < ApplicationRecord
    validates_presence_of :utorid
    validates_uniqueness_of :utorid

    include RoleModel
    roles_attribute :roles_mask
    # The order of roles should not be changed. New roles should be added
    # to the end. Roles can be accessed with `User.is_<role>?` or `User.has_roles? :<role>, ...`
    # See https://github.com/martinrehfeld/role_model
    roles :admin, :instructor, :ta

    def computed_roles
        # Every user has the TA role
        calculated_roles = roles + [:ta]
        calculated_roles += [:instructor] if Instructor.find_by(utorid: utorid)
        # Check if they are listed as an instructor for any course
        calculated_roles += [:admin] if Rails.application.config.always_admin.include?(utorid)

        calculated_roles.uniq
    end
end

# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  utorid     :string
#  roles_mask :integer
#  last_seen  :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
