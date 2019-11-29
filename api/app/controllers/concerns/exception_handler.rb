# frozen_string_literal: true

# Rescue exceptions and return error message in json
module ExceptionHandler
    extend ActiveSupport::Concern

    included do
        rescue_from(StandardError) { |e| render_error(message: e.message) }
    end
end