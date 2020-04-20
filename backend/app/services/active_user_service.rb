# frozen_string_literal: true

class ActiveUserService
    def self.active_user
        # XXX this is only temporary for debugging. It should be replaced with
        # something that gets the user from Shibboleth, etc.
        if (Rails.application.config.respond_to? :active_user_override) &&
           Rails.application.config.active_user_override

            user = User.find_by(id: Rails.application.config.active_user_id)
            return user if user

            # If we're here, the database doesn't have the specified active user,
            # so createa fake one with all the permissions. We *do not* save this
            # user to the database.
            return User.new(utorid: 'defaultactive', roles: ['admin', 'instructor', 'ta'])
        end

        # rubocop:disable Style/RaiseArgs
        raise NotImplementedError.new 'active_user Route is not implimented yet for production mode'
        # rubocop:enable Style/RaiseArgs
    end
end
