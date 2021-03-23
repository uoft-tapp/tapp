# frozen_string_literal: true

class ApplicationSerializer < ActiveModel::Serializer
    attributes :id,
               :comments,
               :program,
               :department,
               :previous_uoft_experience,
               :yip,
               :gpa,
               :status,
               :custom_question_answers,
               :annotation
end
