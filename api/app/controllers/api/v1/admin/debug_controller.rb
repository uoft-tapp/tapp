# frozen_string_literal: true

class Api::V1::Admin::DebugController < ApplicationController
    # POST /active_user
    def active_user
    end

    # POST /clear_data
    def clear_data
        Rake::Task['db:drop'].invoke
    end

    # POST /restore_snapshot
    def restore_snapshot
        Rake::Task['db:reset'].invoke
    end

    # POST /snapshot
    def snapshot
    end
end
