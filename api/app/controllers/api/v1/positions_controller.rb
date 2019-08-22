# frozen_string_literal: true

module Api::V1
    # Controller for Positions
    class PositionsController < ApplicationController
        # GET /positions
        def index
            unless params.include?(:session_id)
                render_success(all_positions)
                return
            end
            return if invalid_id(Session, :session_id)

            render_success(positions_by_session)
        end

        # POST /positions
        def create
            # if we passed in an id that exists, we want to update
            update && return if params.key?(:id) && Position.exists?(params[:id])
            params.require(%i[position_code position_title])
            return if invalid_id(Session, :session_id)

            position = Position.new(position_params)
            unless position.save # does not pass Position model validation
                position.destroy!
                render_error(position.errors.full_messages.join('; '))
                return
            end
            update_instructors_ids(position)
            params[:position_id] = position[:id]
            message = valid_ad_and_matching(position.errors.messages)
            if !message
                render_success(position_data(position))
            else
                position.destroy!
                render_error(message)
            end
        end

        def update
            position = Position.find(params[:id])
            ad = position.position_data_for_ad
            matching = position.position_data_for_matching
            update_instructors_ids(position)

            position_res = position.update_attributes!(position_update_params)
            ad_res = ad.update_attributes!(ad_update_params)
            matching_res = matching.update_attributes!(matching_update_params)

            errors = position.errors.messages.deep_merge(ad.errors.messages)
            errors = errors.deep_merge(matching.errors.messages)
            if ad_res && position_res && matching_res
                render_success(position_data(position))
            else
                render_error(errors)
            end
        end

        # POST /positions/delete
        def delete
            params.require(:id)
            position = Position.find(params[:id])
            entry = position_data(position)
            if position
                matching = position.position_data_for_matching
                ad = position.position_data_for_ad
                matching.destroy!
                ad.destroy!
            end
            if position.destroy!
                render_success(entry)
            else
                render_error(position.errors.full_messages.join('; '))
            end
        end

        private

        # Only allow a trusted parameter "white position" through.
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

        def positions_by_session
            all_positions.select do |entry|
                entry[:session_id] == params[:session_id].to_i
            end
        end

        def all_positions
            Position.order(:id).map do |entry|
                position_data(entry)
            end
        end

        def position_data(position)
            exclusion = %i[id created_at updated_at position_id]
            matching = position.position_data_for_matching
            matching = json(matching, except: exclusion)
            ad = position.position_data_for_ad
            combined = json(ad, include: matching, except: exclusion)
            combined = json(combined, include: { instructor_ids: position.instructor_ids })
            json(position, include: combined)
        end

        def update_instructors_ids(position)
            if params.include?(:instructor_ids)
                return if params[:instructor_ids] == ['']

                params[:instructor_ids].each do |id|
                    Instructor.find(id)
                end
                position.instructor_ids = params[:instructor_ids]
            end
        end

        def valid_ad_and_matching(errors)
            ad = PositionDataForAd.new(position_data_for_ad_params)
            matching = PositionDataForMatching.new(position_data_for_matching_params)
            ad_save = ad.save
            matching_save = matching.save
            if ad_save && matching_save
                return nil
            elsif ad_save && !matching_save
                ad.destroy!
                matching.destroy!
                return errors.deep_merge(matching.errors.messages)
            elsif !ad_save && matching_save
                ad.destroy!
                matching.destroy!
                return errors.deep_merge(ad.errors.messages)
            else
                ad.destroy!
                matching.destroy!
                errors = errors.deep_merge(ad.errors.messages)
                return errors.deep_merge(matching.errors.messages)
            end
        end
    end
end
