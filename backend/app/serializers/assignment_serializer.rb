# frozen_string_literal: true

class AssignmentSerializer < ActiveModel::Serializer
    attributes :id,
               :applicant_id,
               :position_id,
               :start_date,
               :end_date,
               :note,
               :contract_override_pdf,
               :active_offer_status,
               :active_offer_url_token,
               :active_offer_recent_activity_date,
               :active_offer_nag_count,
               :hours
end
