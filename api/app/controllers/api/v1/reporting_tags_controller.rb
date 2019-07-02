# frozen_string_literal: true

module Api::V1
    # Controller for ReportingTags
    class ReportingTagsController < ApplicationController

        # POST /add_reporting_tag
        def create
            params.require(:position_id)
            if invalid_id(WageChunk, :wage_chunk_id, []) then return end
            if invalid_id(Position, :position_id, 
                reporting_tags_by_wage_chunk) then return end
            reporting_tag = ReportingTag.new(reporting_tag_params)
            if reporting_tag.save # passes ReportingTag model validation
                render_success(reporting_tags_by_wage_chunk)
            else
                render_error(reporting_tag.errors, reporting_tags_by_wage_chunk)
            end
        end

        private
        def reporting_tag_params
            params.permit(
                :name,
                :position_id,
                :wage_chunk_id,
            )
        end

        def reporting_tags_by_wage_chunk
            return ReportingTag.order(:id).each do |entry|
                entry[:wage_chunk_id] == params[:wage_chunk_id].to_i
            end
        end

    end
end
