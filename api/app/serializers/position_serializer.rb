class PositionSerializer < ActiveModel::Serializer
    attributes :id, :position_code, :position_title, :hours_per_assignment,
               :start_date, :end_date, :duties, :qualifications, 
               :ad_hours_per_assignment, :ad_num_assignments, :ad_open_date, 
               :ad_close_date, :desired_num_assignments, :current_enrollment, 
               :current_waitlisted, :instructor_ids
end
