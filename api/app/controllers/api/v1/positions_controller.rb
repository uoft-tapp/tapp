# frozen_string_literal: true

# Controller for Positions
class Api::V1::PositionsController < ApplicationController
    before_action :find_position, except: :index

    # GET /positions
    def index
        if params[:session_id].blank?
            render_success Position.all_positions
            return
        end
        return if invalid_id?(Session, :session_id)

        render_success Position.by_session(params[:session_id])
    end

    # POST /positions
    def create
        # if we passed in an id that exists, we want to update
        if params.key?(:id) && @position.present?
            update
            return
        end

        return if invalid_id?(Session, :session_id)

        position = Position.new(position_params)
        unless position.save
            render_error position.errors.full_messages.join('; ')
            return
        end

        # FIXME: This does nothing...
        update_instructors_ids(position)

        message = valid_ad_and_matching(position.errors.messages)
        if message.empty?
            render_success position.as_json
        else
            render_error message
        end
    end

    def update
        ad = @position.position_data_for_ad
        matching = @position.position_data_for_matching
        update_instructors_ids(@position)

        ActiveRecord::Base.transaction do
            position = position.update_attributes!(position_update_params)
            ad = ad.update_attributes!(ad_update_params)
            matching = matching.update_attributes!(matching_update_params)
            render_success position.as_json
            return
        rescue StandardError
            if position_res.errors?
                position.errors.messages.deep_merge(ad.errors.messages)
            elsif ad.errors?
                position.errors.deep_merge(ad.errors.messages)
            elsif matching.errors?
                position.errors.deep_merge(matching.errors.messages)
            end
            raise ActiveRecord::Rollback
        end

        render_error position.errors.full_messages.join('; ')
    end

    # POST /positions/delete
    def delete
        ActiveRecord::Base.transaction do
            matching = @position.position_data_for_matching.destory!
            ad = @position.position_data_for_ad.destroy!
            position = @position.destroy!
            render_success @position.as_json
        rescue StandardError
            if matching.errors?
                render_error(matching.errors.full_messages.join('; '))
            elsif ad.errors?
                render_error(ad.errors.full_messages.join('; '))
            elsif position.errors?
                render_error(position.errors.full_messages.join('; '))
            end
            raise ActiveRecord::Rollback
        end
    end

    private

    def position_params
        params.permit(
            :session_id,
            :position_code,
            :position_title,
            :est_hours_per_assignment,
            :est_start_date,
            :est_end_date,
            :position_type
        )
    end

    def position_data_for_ad_params
        params.permit(
            :position_id,
            :duties,
            :qualifications,
            :ad_hours_per_assignment,
            :ad_num_assignments,
            :ad_open_date,
            :ad_close_date
        )
    end

    def position_data_for_matching_params
        params.permit(
            :position_id,
            :desired_num_assignments,
            :current_enrollment,
            :current_waitlisted
        )
    end

    def position_update_params
        params.permit(
            :position_code,
            :position_title,
            :est_hours_per_assignment,
            :est_start_date,
            :est_end_date,
            :position_type
        )
    end

    def ad_update_params
        params.permit(
            :duties,
            :qualifications,
            :ad_hours_per_assignment,
            :ad_num_assignments,
            :ad_open_date,
            :ad_close_date
        )
    end

    def matching_update_params
        params.permit(
            :desired_num_assignments,
            :current_enrollment,
            :current_waitlisted
        )
    end

    def update_instructors_ids(position)
        # FIXME: What does this do?????????
        if params.include?(:instructor_ids)
            instructor_ids = params[:instructor_ids]
            return if instructor_ids == ['']

            params[:instructor_ids].each do |id|
                Instructor.find(id)
            end
            position.instructor_ids = params[:instructor_ids]
        end
    end

    def valid_ad_and_matching(errors)
        ActiveRecord::Base.transaction do
            ad = PositionDataForAd.create!(position_data_for_ad_params)
            matching = PositionDataForMatching.create!(position_data_for_matching_params)
        rescue StandardError
            if ad.errors?
                errors.deep_merge(ad.errors.messages)
            elsif matching.errors?
                errors.deep_merge(matching.errors.messages)
            end
            raise ActiveRecord::Rollback
        end
        errors
    end

    def find_position
        @position = Position.find(params[:id])
    end
end
