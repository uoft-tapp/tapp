# frozen_string_literal: true

class OfferSerializer < ActiveModel::Serializer
    attributes :id,
               :assignment_id,
               :first_name,
               :last_name,
               :email,
               :position_code,
               :position_title,
               :position_start_date,
               :position_end_date,
               :first_time_ta,
               :instructor_contact_desc,
               :pay_period_desc,
               :installments,
               :ta_coordinator_name,
               :ta_coordinator_email,
               :signature,
               :emailed_date,
               :accepted_date,
               :rejected_date,
               :withdrawn_date,
               :url_token,
               :nag_count,
               :status,
               :hours
end
