# frozen_string_literal: true

class PostingSerializer < ActiveModel::Serializer
    attributes :id,
               :name,
               :open_date,
               :close_date,
               :intro_text,
               :availability,
               :custom_questions,
               :application_ids,
               :url_token

    def application_ids
        object.applications.ids
    end
end
