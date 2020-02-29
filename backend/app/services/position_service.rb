# frozen_string_literal: true

class PositionService
    attr_reader :position

    def initialize(params: nil, position: nil)
        @params = params
        @position = position
        @position_data_for_matching = @position.position_data_for_matching if @position
        @position_data_for_ad = @position.position_data_for_ad if @position
        @all_position_attrs = {}
    end

    def perform
        @position = Position.new(position_params)
        @position.save!
        @position.instructor_ids = instructor_ids if instructor_ids
        @position_data_for_ad = @position.create_position_data_for_ad(position_data_for_ad_params)
        @position_data_for_matching = @position.create_position_data_for_matching(position_data_for_matching_params)
        @position_data_for_matching.save!
        @position_data_for_ad.save!
    end

    def update(params:)
        @params = params
        @position.update!(position_params)
        @position.instructor_ids = instructor_ids if instructor_ids
        @position_data_for_ad.update!(position_data_for_ad_params)
        @position_data_for_matching.update!(position_data_for_matching_params)
    end

    def values
        # merge @position attrs last so the `id`
        # field is the position id
        @all_position_attrs = (@position_data_for_matching.as_json || {})
                              .merge(@position_data_for_ad.as_json || {})
                              .merge(@position.as_json)
                              .merge(instructor_ids: @position.instructor_ids)
                              .symbolize_keys
    end

    private

    def position_params
        @params.slice(:id, :position_code, :position_title, :hours_per_assignment,
                      :start_date, :end_date,
                      :session_id, :contract_template_id)
    end

    def position_data_for_matching_params
        @params.slice(:desired_num_assignments, :current_enrollment, :current_waitlisted)
    end

    def position_data_for_ad_params
        @params.slice(:duties, :qualifications,
                      :ad_hours_per_assignment, :ad_num_assignments,
                      :ad_open_date, :ad_close_date)
    end

    def instructor_ids
        @params[:instructor_ids]
    end
end
