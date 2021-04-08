# frozen_string_literal: true

class ApplicationSerializer < ActiveModel::Serializer
    attributes :id,
               :applicant_id,
               :posting_id,
               :comments,
               :program,
               :department,
               :previous_uoft_experience,
               :yip,
               :gpa,
               :status,
               :custom_question_answers,
               :annotation,
               :documents

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
end
