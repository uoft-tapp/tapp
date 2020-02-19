# frozen_string_literal: true

class Api::V1::Admin::SessionPositionsController < ApplicationController
    before_action :find_session

    # GET /positions
    def index
        render_success @session.positions
    end

    # POST /positions
    def create
        @position = @session.positions.find_by_id(params[:id])

        # Call the PositionsConroller upsert method directly so we
        # don't have to repeat logic. The `upsert` method is not the
        # Rails upsert, it is custom created, so it is safe to call without
        # properly "initializing" the conroller.
        controller = self.class.module_parent::PositionsController.new
        render_success controller.upsert(params: params, position: @position)
    end

    private

    def find_session
        @session = Session.find(params[:session_id])
    end
end
