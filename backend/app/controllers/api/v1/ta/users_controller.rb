# frozen_string_literal: true

class Api::V1::TA::UsersController < ApplicationController
    def active_user
        render_success ActiveUserService.active_user
    end
end
