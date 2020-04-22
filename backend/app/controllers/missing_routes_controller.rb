# frozen_string_literal: true

class MissingRoutesController < ApplicationController
    def error
        render_error(message: "404: Route not found (/#{params[:path]})")
    end
end
