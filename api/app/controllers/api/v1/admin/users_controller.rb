# frozen_string_literal: true

class Api::V1::Admin::UsersController < ApplicationController
    # GET /users
    def index
        render_success User.all
    end

    # POST /users
    def create
        @user = User.find_by(id: params[:id])
        update && return if @user
        @user = User.new(user_params)
        render_on_condition(object: @user,
                            condition: proc { @user.save! })
    end

    private

    def user_params
        params.permit(:id, :utorid, :email, roles: [])
    end

    def update
        render_on_condition(object: @user,
                            condition: proc {
                                @user.update!(user_params)
                            })
    end
end
