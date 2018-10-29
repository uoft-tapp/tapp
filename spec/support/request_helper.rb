# frozen_string_literal: true

module Requests
  module JsonHelpers
    def json
      JSON.parse(last_response.body)
    end
  end
end
