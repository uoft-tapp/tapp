# frozen_string_literal: true

class Api::V1::Admin::WageChunkReportingTagsController < ApplicationController
    before_action :find_wage_chunk

    # GET /wage_chunks/:wage_chunk_id/reporting_tags
    def show
        render_success @wage_chunk.reporting_tags
    end

    # POST /wage_chunks/:wage_chunk_id/reporting_tags
    def create
        start_transaction_and_rollback_on_exception do
            reporting_tag =
                ReportingTag.find_or_create_by(name: reporting_tag_name)
            reporting_tag.save!

            # A reporting tag can show up at most once in a reporting tags list,
            # so check if it's already included
            unless @wage_chunk.reporting_tag_ids.include?(reporting_tag.id)
                @wage_chunk.reporting_tags << reporting_tag
            end
            @wage_chunk.save!

            render_success reporting_tag
        end
    end

    # POST /wage_chunks/:wage_chunk_id/reporting_tags/delete
    def delete
        reporting_tag = ReportingTag.find_by(name: reporting_tag_name)
        unless reporting_tag &&
                   @wage_chunk.reporting_tag_ids.include?(reporting_tag.id)
            render_error(
                message:
                    "No reporting tag with name='#{
                        reporting_tag_name
                    }' associated with wage_chunk_id=#{@wage_chunk.id}"
            )
        end
        render_on_condition(
            object: reporting_tag,
            condition:
                proc do
                    @wage_chunk.reporting_tags.delete(reporting_tag)
                    @wage_chunk.save!
                end
        )
    end

    private

    def find_wage_chunk
        @wage_chunk = WageChunk.find(params[:wage_chunk_id])
    end

    def reporting_tag_name
        params.require(:name)
    end
end
