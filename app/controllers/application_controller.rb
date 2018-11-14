# frozen_string_literal: true

# Base class from which most controllers will inherit from
class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session

  include Response
  include ExceptionHandler
  include Authenticable
end
