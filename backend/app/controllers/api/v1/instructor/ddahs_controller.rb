# frozen_string_literal: true

class Api::V1::Instructor::DdahsController < ApplicationController
    before_action :validate_instructor

    # GET /sessions/:session_id/ddahs
    def index
        render_success Ddah.by_session(params[:session_id]).by_instructor(
                           @active_instructor.id
                       )
    end

    # GET /ddahs/:ddah_id
    def show
        find_ddah
        unless @ddah
            render_error(
                message:
                    "Instructor '#{
                        @active_instructor.utorid
                    }' does not have permission to access Ddah with 'id'=#{
                        params[:id]
                    }"
            )
        end
        render_success @ddah
    end

    # POST /ddahs
    def create
        find_or_create

        # It is possible that `Ddah.find(...)` didn't find a DDAH, which means we passed
        # an invalid id field and we didn't pass an `assignment_id` field. We cannot continue
        # in this case.
        unless @ddah
            render_error(
                message:
                    'Cannot create a DDAH without an assignment_id OR improper permissions to access/create a DDAH'
            ) && return
        end

        # Since `update` referrs to `@ddah`, and we either have an existing or a new (unsaved)
        # `@ddah`, it is safe to just call `update` here.
        update
    end

    private

    def validate_instructor
        @active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor.
        @active_instructor = Instructor.find_by(utorid: @active_user.utorid)
        render_error(message: 'Not an instructor') unless @active_instructor
    end

    def find_or_create
        @ddah = nil

        # look up the DDAH first by assignment ID, otherwise, create a new DDAH
        if params[:assignment_id]
            assignment = Assignment.find_by(id: params[:assignment_id])
            if assignment.accessible_by_instructor(@active_instructor.id)
                @ddah = assignment.ddah || Ddah.new(ddah_params)
            end
        else
            find_ddah
        end
    end

    def find_ddah
        @ddah = nil

        ddah = Ddah.find(params[:id])
        @ddah = ddah if ddah.accessible_by_instructor(@active_instructor.id)
    end

    def ddah_params
        params.slice(:assignment_id).permit!
    end

    def update
        render_on_condition(
            object: @ddah,
            condition:
                proc do
                    service = DdahService.new(params: params, ddah: @ddah)
                    service.update!
                end
        )
    end
end
