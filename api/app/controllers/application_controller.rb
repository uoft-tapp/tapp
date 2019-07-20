# frozen_string_literal: true

# Base class from which most controllers will inherit from
class ApplicationController < ActionController::Base
  	include Response
  	include ExceptionHandler

  	def index
    	render :file => 'public/index.html'
		end  
		
		def not_found
			raise ActionController::RoutingError.new('Unknown Route')
		end

end
