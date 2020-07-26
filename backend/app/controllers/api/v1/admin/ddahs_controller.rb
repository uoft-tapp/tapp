# frozen_string_literal: true

class Api::V1::Admin::DdahsController < ApplicationController
    # GET /sessions/:session_id/ddahs
    def index
        render_success Ddah.by_session(params[:session_id])
    end

    # GET /ddahs/:ddah_id
    def show
        find_ddah
        render_success @ddah
    end

    # GET /assignments/:id/ddah
    def show_by_assignment
        # Because we are being routed through `/assignments`, the param is :id
        # and not :assignment_id
        assignment = Assignment.find(params[:id])
        render_success assignment.ddah
    end

    # POST /assignments/:id/ddah
    def upsert_by_assignment
        # We'll mangle the `params` variable in place and fall back to the
        # usual `create` function
        # Because we are being routed through `/assignments`, the param is :id
        # and not :assignment_id
        params[:assignment_id] = params[:id]
        create
    end

    # POST /ddahs
    def create
        # look up the DDAH first by assignment ID, otherwise, create a new DDAH
        @ddah =
            Assignment.find_by(id: params[:assignment_id]).ddah ||
                Ddah.new(ddah_params)
        # Since `update` referrs to `@ddah`, and we either have an existing or a new (unsaved)
        # `@ddah`, it is safe to just call `update` here.
        update
    end

    # POST /ddahs/:ddah_id/approve
    def approve
        find_ddah
        unless @ddah.approved_date
            @ddah.approve
            @ddah.save!
        end
        render_success @ddah
    end

    # POST /ddahs/:ddah_id/email
    def email
        find_ddah

        DdahMailer.email_ddah(@ddah).deliver_now!

        unless @ddah.emailed_date
            @ddah.email
            @ddah.save!
        end
        render_success @ddah
    end

    private

    def find_ddah
        @ddah = Ddah.find(params[:id])
    end

    def ddah_params
        params.slice(
            :assignment_id,
            :approved_date,
            :accepted_date,
            :revised_date,
            :emailed_date,
            :signature
        ).permit!
    end

    def duty_params
        params.slice(:duties).permit(duties: %i[order hours description])
    end

    def update
        render_on_condition(
            object: @ddah,
            condition:
                proc do
                    @ddah.update!(ddah_params)
                    if duty_params[:duties] && @ddah.duties
                        # if we specified duties, delete the old ones and add the new ones
                        @ddah.duties.destroy_all
                    end
                    @ddah.duties_attributes = duty_params[:duties]
                    @ddah.save!
                end
        )
    end
end
