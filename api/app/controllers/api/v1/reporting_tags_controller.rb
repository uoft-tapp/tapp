# frozen_string_literal: true

module Api::V1
    # Controller for ReportingTags
    class ReportingTagsController < ApplicationController

        # POST /add_reporting_tag
        def create
            if not WageChunk.exists?(id: params[:wage_chunk_id])
                render json: { status: 'error', message: 'Invalid wage_chunk_id', payload: {} }
                return
            end
            if not Position.exists?(id: params[:position_id])
                render json: { status: 'error', message: 'Invalid position_id', payload: {} }
                return
            end
            reporting_tag = WageChunk.new(reporting_tag_params)
            if reporting_tag.save # passes ReportingTag model validation
                render json: { status: 'success', 
                    message: '', payload: reporting_tags_by_wage_chunk }
            else
                render json: { status: 'error', 
                    message: reporting_tag.errors, payload: reporting_tags_by_wage_chunk }
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
