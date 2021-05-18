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
            return(
                logged_user(
                    User.new(utorid: utorid, roles: user.computed_roles),
                    'Basic Auth'
                )
            )
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

            return(
                logged_user(
                    User.new(utorid: user.utorid, roles: user.computed_roles),
                    'Debug ActiveUser Override'
                )
            )
        end

        # If we made it here, we should be using Shibboleth authentication.
        # According to TAPP-CP (tapp v1), this means the 'HTTP_X_FORWARDED_USER' env var
        # should be set to the utorid.
        if request.env['HTTP_X_FORWARDED_USER']
            utorid = request.env['HTTP_X_FORWARDED_USER']
            user = User.find_by(utorid: utorid) || User.new(utorid: utorid)
            return(
                logged_user(
                    User.new(utorid: utorid, roles: user.computed_roles),
                    'Shibboleth'
                )
            )
        end

        # If we made it here, none of the authentication methods applied.
        # Print out some debug information before erroring
        Rails
            .logger.warn 'Failed all authentication methods. Printing request.env for debugging purposes.'
        Rails.logger.warn request.headers.env.reject { |key|
                              key.to_s.include?('.')
                          }.to_json

        # rubocop:disable Style/RaiseArgs
        raise NotImplementedError.new 'active_user Route is not implemented for this authentication type'
        # rubocop:enable Style/RaiseArgs
    end
end

def logged_user(user, auth_type)
    Rails.logger.warn do
        blue_bold_start = ''
        magenta_start = ''
        color_end = ''
        if Rails.env.development?
            # Format the traceback message to be in color if we're in dev mode.
            blue_bold_start = "\e[1;34m"
            magenta_start = "\e[0;35m"
            color_end = "\e[0m"
        end
        "#{magenta_start}Authenticated '#{blue_bold_start}#{user.utorid}#{
            magenta_start
        }' as #{user.roles.to_json} (auth type: #{auth_type})#{color_end}"
    end

    user
end
