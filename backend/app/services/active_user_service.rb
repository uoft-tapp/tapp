# frozen_string_literal: true

class ActiveUserService
    # `request` is the Rails request object. You can access `request.env`
    # to retrieve the Basic Auth or Shibboleth auth variables
    def self.active_user(request)
        # If we're running in debug mode, we can fake the active user.
        # The config variable `active_user_override` is only set in debug/test mode,
        # so we can rely on it; if it exists, we're in debug mode.

        # If we're configured to use Apache's Basic Auth, use that. The alternative is Shibboleth (not yet implemented)
        if Rails.application.config.allow_basic_auth &&
               ActionController::HttpAuthentication::Basic
                   .has_basic_credentials?(request)
            credentials =
                ActionController::HttpAuthentication::Basic.decode_credentials(
                    request
                )
            utorid, _password = credentials.split(':')
            user = User.find_by(utorid: utorid) || User.new(utorid: utorid)
            return User.new(utorid: utorid, roles: user.computed_roles)
        end

        if (Rails.application.config.respond_to? :active_user_override) &&
               Rails.application.config.active_user_override
            # If we're here, the database doesn't have the specified active user,
            # so create a fake one with all the permissions. We *do not* save this
            # user to the database.
            user =
                User.find_by(id: Rails.application.config.active_user_id) ||
                    User.new(
                        utorid: 'defaultactive', roles: %w[admin instructor ta]
                    )
            return User.new(utorid: user.utorid, roles: user.computed_roles)
        end

        # If we made it here, we should be using Shibboleth authentication.
        # According to TAPP-CP (tapp v1), this means the 'HTTP_X_FORWARDED_USER' env var
        # should be set to the utorid.
        if request.env['HTTP_X_FORWARDED_USER']
            utorid = request.env['HTTP_X_FORWARDED_USER']
            user = User.find_by(utorid: utorid) || User.new(utorid: utorid)
            return User.new(utorid: utorid, roles: user.computed_roles)
        end

        # rubocop:disable Style/RaiseArgs
        raise NotImplementedError.new 'active_user Route is not implemented for this authentication type'
        # rubocop:enable Style/RaiseArgs
    end
end
