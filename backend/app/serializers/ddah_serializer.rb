# frozen_string_literal: true

class DdahSerializer < ActiveModel::Serializer
    attributes :id,
               :assignment_id,
               :approved_date,
               :accepted_date,
               :revised_date,
               :emailed_date,
               :signature,
               :url_token,
               :duties

    def duties
        ddah_service = DdahService.new ddah: object
        ddah_service.normalized_duties.map do |duty|
            duty.slice(:order, :hours, :description)
        end
    end
end
