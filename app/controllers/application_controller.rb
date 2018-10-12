# frozen_string_literal: true

# Base class from which most controllers will inherit from
class ApplicationController < ActionController::API
  include Response
  include ExceptionHandler
end
