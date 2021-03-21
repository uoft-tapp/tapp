# frozen_string_literal: true

class PostingSerializer < ActiveModel::Serializer
    attributes :id,
               :name,
               :open_date,
               :close_date,
               :intro_text,
               :availability,
               :custom_questions,
               :posting_positions,
               :applications

    def posting_positions
        object.posting_positions.ids
    end

    def applications
        object.applications.ids
    end
end
