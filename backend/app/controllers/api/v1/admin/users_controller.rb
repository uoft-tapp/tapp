# frozen_string_literal: true

class Api::V1::Admin::UsersController < ApplicationController
    def active_user
        render_success ActiveUserService.active_user
    end

    # GET /users
    def index
        render_success User.all
    end

    # POST /users
    def create
        # We can update a user by id or utorid
        @user = User.find_by(id: params[:id])
        update && return if @user
        @user = User.find_by(utorid: params[:utorid])
        update && return if @user

        @user = User.new(user_params)
        render_on_condition(object: @user,
                            condition: proc { @user.save! })
    end

    private

    def user_params
        params.permit(:id, :utorid, roles: [])
    end

    def update
        render_on_condition(object: @user,
                            condition: proc {
                                @user.update!(user_params)
                            })
    end
end
