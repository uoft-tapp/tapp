# frozen_string_literal: true

# Rescue exceptions and return error message in json
module ExceptionHandler
    extend ActiveSupport::Concern

    included do
        rescue_from(StandardError) do |e|
            render_error(message: e.message, error: e)
        end
    end
end
