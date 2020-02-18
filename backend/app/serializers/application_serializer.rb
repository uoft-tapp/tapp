# frozen_string_literal: true

class ApplicationSerializer < ActiveModel::Serializer
    attributes :id, :comments, :program, :department, :previous_uoft_experience,
               :yip, :annotation

    def program
        object.applicant_data_for_matching&.program
    end

    def department
        object.applicant_data_for_matching&.department
    end

    def previous_uoft_experience
        object.applicant_data_for_matching&.previous_uoft_experience
    end

    def yip
        object.applicant_data_for_matching&.yip
    end

    def annotation
        object.applicant_data_for_matching&.annotation
    end
end
