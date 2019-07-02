# frozen_string_literal: true

# Rescue exceptions and return error message in json
module ExceptionHandler
    # provides the more graceful `included` method
    extend ActiveSupport::Concern

    included do
        rescue_from ActiveRecord::RecordNotFound do |e|
            render_error(e.message)
        end

        rescue_from ActiveRecord::RecordInvalid do |e|
            render_error(e.message)
        end

        rescue_from ActionController::ParameterMissing do |e|
            render_error(e.message)
        end
    end
end
