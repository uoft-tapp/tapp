# frozen_string_literal: true

class PositionService
    attr_reader :position

    def initialize(params: nil, position: nil)
        @params = params
        @position = position
        if @position
            @position_data_for_matching = @position.position_data_for_matching
        end
        @all_position_attrs = {}
    end

    def perform
        @position = Position.new(position_params)
        @position.save!
        @position.instructor_ids = instructor_ids if instructor_ids
        @position_data_for_matching =
            @position.create_position_data_for_matching(
                position_data_for_matching_params
            )
        @position_data_for_matching.save!
    end

    def update(params:)
        @params = params
        @position.update!(position_params)
        @position.instructor_ids = instructor_ids if instructor_ids
        @position_data_for_matching.update!(position_data_for_matching_params)
    end

    def values
        # merge @position attrs last so the `id`
        # field is the position id
        @all_position_attrs =
            (@position_data_for_matching.as_json || {})
                .merge(@position.as_json)
                .merge(instructor_ids: @position.instructor_ids)
                .symbolize_keys
    end

    private

    def position_params
        @params.slice(
            :id,
            :position_code,
            :position_title,
            :hours_per_assignment,
            :start_date,
            :end_date,
            :session_id,
            :duties,
            :qualifications,
            :contract_template_id
        )
    end

    def position_data_for_matching_params
        @params.slice(
            :desired_num_assignments,
            :current_enrollment,
            :current_waitlisted
        )
    end

    def instructor_ids
        @params[:instructor_ids]
    end
end
