# frozen_string_literal: true

class AssignmentSerializer < ActiveModel::Serializer
    attributes :id, :applicant_id, :position_id, :start_date, :end_date,
               :note, :offer_override_pdf, :active_offer_status
end
