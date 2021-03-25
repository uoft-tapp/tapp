# frozen_string_literal: true

class UserSerializer < ActiveModel::Serializer
    attributes :id, :utorid, :roles

    def roles
        utorid = object.utorid
        # Every user has the TA role
        roles = if object.roles.include? 'ta'
                    object.roles
                else
                    object.roles + %w[ta]
                end

        roles += %w[instructor] if Instructor.find_by(utorid: utorid)
        # Check if they are listed as an instructor for any course
        if Rails.application.config.always_admin.include?(utorid)
            roles += %w[admin]
        end

        roles
    end

end
