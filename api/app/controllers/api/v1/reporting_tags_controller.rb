# frozen_string_literal: true

module Api::V1
    # Controller for ReportingTags
    class ReportingTagsController < ApplicationController
        # GET /reporting_tags
        def index
            render_success(ReportingTag.order(:id))
        end

        # POST /add_reporting_tag
        def create
            # if we passed in an id that exists, we want to update
            update && return if params.key?(:id) && ReportingTag.exists?(params[:id])
            params.require(%i[name])
            return if invalid_id(WageChunk, :wage_chunk_id, [])

            reporting_tag = ReportingTag.new(reporting_tag_params)
            if reporting_tag.save # passes ReportingTag model validation
                update_position_ids(reporting_tag)
                render_success(reporting_tags_by_wage_chunk)
            else
                reporting_tag.destroy!
                render_error(reporting_tag.errors, reporting_tags_by_wage_chunk)
            end
        end

        def update
            reporting_tag = ReportingTag.find(params[:id])
            if reporting_tag.update_attributes!(reporting_tag_update_params)
                update_position_ids(reporting_tag)
                render_success(reporting_tag)
            else
                render_error(reporting_tag.errors)
            end
        end

        # POST /reporting_tags/delete
        def delete
            params.require(:id)
            reporting_tag = ReportingTag.find(params[:id])
            if reporting_tag.destroy!
                render_success(reporting_tag)
            else
                render_error(reporting_tag.errors.full_messages.join('; '))
            end
        end

        private

        def reporting_tag_params
            params.permit(
                :name
            )
        end

        def reporting_tag_update_params
            params.permit(
                :name
            )
        end

        def reporting_tags_by_wage_chunk
            ReportingTag.order(:id).select do |entry|
                entry.wage_chunk_ids.include?(params[:wage_chunk_id].to_i)
            end
        end

        def position_id_by_wage_chunk(reporting_tag)
            wage_chunk = WageChunk.find(params[:wage_chunk_id])
            reporting_tag.wage_chunk_ids.push(wage_chunk[:id])
            reporting_tag.wage_chunk_ids = reporting_tag.wage_chunk_ids.uniq
            assignment = Assignment.find(wage_chunk[:assignment_id])
            assignment[:position_id]
        end

        def update_position_ids(reporting_tag)
            position_id = position_id_by_wage_chunk(reporting_tag)
            reporting_tag.position_ids.push(position_id)
            reporting_tag.position_ids = reporting_tag.position_ids.uniq
        end
    end
end
