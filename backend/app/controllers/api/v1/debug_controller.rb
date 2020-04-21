# frozen_string_literal: true

class Api::V1::DebugController < ApplicationController
    # GET /users
    def users
        render_success User.all
    end

    # POST /users
    def upsert_user
        # We can update a user by id or utorid
        @user = User.find_by(id: params[:id])
        update_user && return if @user
        @user = User.find_by(utorid: params[:utorid])
        update_user && return if @user

        @user = User.new(user_params)
        render_on_condition(object: @user,
                            condition: proc { @user.save! })
    end

    # GET /active_user
    def active_user
        render_success ActiveUserService.active_user
    end

    # POST /active_user
    def set_active_user
        @active_user = User.find_by(id: set_active_user_params[:id]) ||
                       User.find_by(utorid: set_active_user_params[:utorid])
        if @active_user
            Rails.application.config.active_user_id = @active_user.id
            return render_success @active_user
        end
        render_error(message: "Could not find user matching #{set_active_user_params}")
    end

    # POST /snapshot
    def snapshot
        Rake::Task['debug:snapshot'].execute
        render_success
    end

    # POST /clear_data
    def clear_data
        Rake::Task['db:schema:load'].execute
        render_success
    end

    # POST /restore_snapshot
    def restore_snapshot
        Rake::Task['debug:restore'].execute
        render_success
    end

    private

    def set_active_user_params
        params.permit(:id, :utorid)
    end

    def user_params
        params.permit(:id, :utorid, roles: [])
    end

    def update_user
        render_on_condition(object: @user,
                            condition: proc {
                                @user.update!(user_params)
                            })
    end
end
