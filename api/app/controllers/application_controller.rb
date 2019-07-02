# frozen_string_literal: true

# Base class from which most controllers will inherit from
class ApplicationController < ActionController::Base
  	include Response
  	include ExceptionHandler

  	def index
    	render :file => 'public/index.html'
  	end  

  	rescue_from ActionController::ParameterMissing do |e|
    	render json: {status: 'error', message: e.message, payload: {}}  
	end

end
