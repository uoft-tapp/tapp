# frozen_string_literal: true

class PositionSerializer < ActiveModel::Serializer
    def initialize(*args, **kwargs)
        super(*args, **kwargs)
        # We want to combine position's data with position_data_for_matching
        # and position_data_for_ad. `PositionService` does exactly this.
        @service = PositionService.new(position: object)
    end

    private

    def attributes(*_args)
        @service.values.slice(
            :id,
            :position_code,
            :position_title,
            :start_date,
            :end_date,
            :hours_per_assignment,
            :contract_template_id,
            :qualifications,
            :duties,
            :desired_num_assignments,
            :current_enrollment,
            :current_waitlisted,
            :instructor_ids
        )
    end
end
