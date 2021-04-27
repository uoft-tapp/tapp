# frozen_string_literal: true

class ApplicationSerializer < ActiveModel::Serializer
    attributes :id,
               :applicant_id,
               :posting_id,
               :comments,
               :program,
               :department,
               :previous_uoft_experience,
               :first_time_ta,
               :yip,
               :gpa,
               :custom_question_answers,
               :annotation,
               :documents,
               :position_preferences

    def documents
        object.documents.blobs.map do |blob|
            {
                name: blob.filename,
                type: blob.content_type,
                size: blob.byte_size,
                url_token: blob.key
            }
        end
    end

    def position_preferences
        object.position_preferences.map do |position_preference|
            {
                position_id: position_preference.position_id,
                preference_level: position_preference.preference_level
            }
        end
    end
end
