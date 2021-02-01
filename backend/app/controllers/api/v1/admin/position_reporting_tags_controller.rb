# frozen_string_literal: true

class Api::V1::Admin::PositionReportingTagsController < ApplicationController
    before_action :find_position

    # GET /positions/:position_id/reporting_tags
    def show
        render_success @position.reporting_tags
    end

    # POST /positions/:position_id/reporting_tags
    def create
        start_transaction_and_rollback_on_exception do
            reporting_tag =
                ReportingTag.find_or_create_by(name: reporting_tag_name)
            reporting_tag.save!

            # A reporting tag can show up at most once in a reporting tags list,
            # so check if it's already included
            unless @position.reporting_tag_ids.include?(reporting_tag.id)
                @position.reporting_tags << reporting_tag
            end
            @position.save!

            render_success reporting_tag
        end
    end

    # POST /positions/:position_id/reporting_tags/delete
    def delete
        reporting_tag = ReportingTag.find_by(name: reporting_tag_name)
        unless reporting_tag &&
                   @position.reporting_tag_ids.include?(reporting_tag.id)
            render_error(
                message:
                    "No reporting tag with name='#{
                        reporting_tag_name
                    }' associated with position_id=#{@position.id}"
            )
        end
        render_on_condition(
            object: reporting_tag,
            condition:
                proc do
                    @position.reporting_tags.delete(reporting_tag)
                    @position.save!
                end
        )
    end

    private

    def find_position
        @position = Position.find(params[:position_id])
    end

    def reporting_tag_name
        params.require(:name)
    end
end
