# frozen_string_literal: true

class PostingSerializer < ActiveModel::Serializer
    attributes :id,
               :name,
               :open_date,
               :close_date,
               :intro_text,
               :availability,
               :custom_questions,
               :posting_position_ids,
               :application_ids,
               :url_token

    def posting_position_ids
        object.posting_positions.ids
    end

    def application_ids
        object.applications.ids
    end

    def custom_questions
        # The custom questions are stored as JSON strings in the database,
        # but this should be transpared to API users.
        JSON.parse object.custom_questions
    end
end
