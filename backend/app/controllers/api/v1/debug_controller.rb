# frozen_string_literal: true

class Api::V1::DebugController < ApplicationController
    # GET /active_user
    def active_user
        @active_user = ActiveUser.last
        render_success @active_user
    end

    # POST /active_user
    def create_active_user
        @active_user = ActiveUser.new(active_user_create_params)
        render_on_condition(object: @active_user,
                            condition: proc { @active_user.save! })
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

    def active_user_create_params
        params.permit(credentials: {})
        render_success
    end
end
