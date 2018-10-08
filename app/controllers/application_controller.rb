# frozen_string_literal: true

# Base class from which most controllers will inherit from
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
end
