# frozen_string_literal: true

class Api::V1::Admin::AssignmentsController < ApplicationController
    # GET /sessions/:session_id/assignments
    def index
        render_success Assignment.by_session(params[:session_id])
    end

    # GET /assignments/:assignment_id
    def show
        @assignment = Assignment.find(params[:id])
        render_success @assignment
    end

    # POST /assignments
    def create
        @assignment = Assignment.find_by(id: params[:id])
        update && return if @assignment

        @assignment = Assignment.new(assignment_params)
        render_on_condition(
            object: @assignment, condition: proc { @assignment.save! }
        )
    end

    # POST /assignments/delete
    def delete
        @assignment = Assignment.find(params[:id])
        render_on_condition(
            object: @assignment,
            condition: proc { @assignment.destroy! },
            error_message:
            'Could not delete assignment; it may have an associated offer. ' \
            'If so, the assignment can be withdrawn and edited, but not deleted.'
        )
    end

    private

    def assignment_params
        params.permit(
            :applicant_id,
            :position_id,
            :start_date,
            :end_date,
            :note,
            :contract_override_pdf,
            :hours
        )
    end

    def update
        render_on_condition(
            object: @assignment,
            condition:
                proc do
                    # if the assignment has an active offer and it is not provisional or withdrawn,
                    # we cannot update the assignment
                    if @assignment.active_offer &&
                           !%w[provisional withdrawn].include?(
                               @assignment.active_offer.status
                           )
                        raise StandardError,
                              "Cannot modify an assignment that has an active offer with status '#{
                                  @assignment.active_offer.status
                              }'"
                    end
                    @assignment.update(assignment_params)
                    # If we ever get to the point where we are updating an assignment, it
                    # cannot have an active offer associated with it (because it's just changed,
                    # so it will be out of sync with the active offer). Therefore,
                    # we remove the active offer on any update.
                    @assignment.active_offer = nil
                    @assignment.save!
                end
        )
    end
end
