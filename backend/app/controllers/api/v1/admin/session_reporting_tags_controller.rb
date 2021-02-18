# frozen_string_literal: true

class Api::V1::Admin::SessionReportingTagsController < ApplicationController
    before_action :find_session

    # GET /sessions/:session_id/positions/reporting_tags
    def index_by_position
        render_success ReportingTag.position_reporting_tags_by_session(
                           @session.id
                       )
    end

    # GET /sessions/:session_id/wage_chunks/reporting_tags
    def index_by_wage_chunk
        render_success ReportingTag.wage_chunk_reporting_tags_by_session(
                           @session.id
                       )
    end

    private

    def find_session
        @session = Session.find(params[:session_id])
    end
end
