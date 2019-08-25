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
            update && return if update_condition(WageChunk)
            return if invalid_id_check(WageChunk)

            params.require(:name)
            output = proc { reporting_tags_by_wage_chunk }
            update_fn = proc do |entry|
                update_position_ids(entry)
                render_success(output.call)
            end
            create_entry(ReportingTag, reporting_tag_params, output: output, after_fn: update_fn)
        end

        def update
            update_fn = proc { |i| update_position_ids(i) }
            update_entry(ReportingTag, reporting_tag_update_params, update_fn: update_fn)
        end

        # POST /reporting_tags/delete
        def delete
            delete_entry(ReportingTag)
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
