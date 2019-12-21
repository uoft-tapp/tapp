# frozen_string_literal: true

class ApplicationController < ActionController::API
    include Response
    include ExceptionHandler
    include TransactionHandler

    # Don't wrap parameters
    # https://guides.rubyonrails.org/action_controller_overview.html#json-xml-parameters
    wrap_parameters false
end
