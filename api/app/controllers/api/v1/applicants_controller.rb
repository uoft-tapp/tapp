# frozen_string_literal: true

# Controller for Applicants
class Api::V1::ApplicantsController < ApplicationController
    before_action :find_applicant, only: %i[create destroy]

    # GET /applicants
    def index
        if params[:session_id].blank?
            render_success(Applicant.order(:id))
            return
        end
        return if invalid_id?(Session, :session_id)

        render_success Applicant.by_session(params[:session_id])
    end

    # POST /applicants
    def create
        if params[:id].present? && @applicant.present?
            update
            return
        end
        applicant = Applicant.new(applicant_params)
        if applicant.save
            render_success applicant
        else
            render_error applicant.errors
        end
    end

    # POST /applicants/delete
    def delete
        if @applicant.destroy
            render_success @applicant
        else
            render_error @applicant.errors.full_messages.join('; ')
        end
    end

    private

    def applicant_params
        params.permit(
            :email,
            :first_name,
            :last_name,
            :phone,
            :student_number,
            :utorid
        )
    end

    def find_applicant
        @applicant = Applicant.find_by(id: params[:id])
    end

    def update
        if @applicant.update_attributes! applicant_params
            render_success @applicant
        else
            render_error @applicant.errors
        end
    end

    # FIXME: Session_id doesn't exist as an attribute as part of an applicant....
    # def applicants_by_session
    #     Applicant.order(:id).select do |entry|
    #         entry[:session_id] == params[:session_id].to_i
    #     end
    # end
end
