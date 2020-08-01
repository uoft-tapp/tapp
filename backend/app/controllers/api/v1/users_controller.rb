# frozen_string_literal: true

class Api::V1::UsersController < ApplicationController
    def active_user
        render_success ActiveUserService.active_user request
    end
end
