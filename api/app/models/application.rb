# frozen_string_literal: true

# A class representing an application of an applicant.
class Application < ApplicationRecord
    belongs_to :session
    has_one :applicant_data_for_matching, dependent: :destroy
    has_one :applicant, through: :applicant_data_for_matching
    has_many :position_preferences
    has_many :positions, through: :position_preferences

    JSON_EXCEPTIONS = %i[id created_at updated_at application_id].freeze

    scope :all_applications, -> { includes(:applicant_data_for_matching).all.order(:id) }
    scope :by_session, ->(session_id) { all_applications.where(session_id: session_id) }

    def as_json(_options = {})
        super(except: JSON_EXCEPTIONS, include: { applicant_data_for_matching: { except: JSON_EXCEPTIONS } })
    end
end

# == Schema Information
#
# Table name: applications
#
#  id         :bigint(8)        not null, primary key
#  comments   :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  session_id :bigint(8)
#
# Indexes
#
#  index_applications_on_session_id  (session_id)
#
