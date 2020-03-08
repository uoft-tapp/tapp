# frozen_string_literal: true

# A class representing an assignment. This class has many offers and belongs to
# applicant and position.
class Assignment < ApplicationRecord
    ACTIVE_OFFER_STATUS = %i[pending accepted rejected withdrawn].freeze
    enum active_offer_status: ACTIVE_OFFER_STATUS

    has_many :offers
    has_many :wage_chunks, dependent: :delete_all
    belongs_to :active_offer, class_name: 'Offer', optional: true
    belongs_to :applicant
    belongs_to :position

    validates_uniqueness_of :applicant_id, scope: [:position_id]

    scope :by_position, ->(position_id) { where(position_id: position_id).order(:id) }
    scope(:by_session, lambda do |session_id|
        joins(:position)
            .where('positions.session_id = ?', session_id)
            .distinct.order(:id)
    end)

    after_create :split_and_create_wage_chunks

    def hours
        wage_chunks.sum(:hours)
    end

    def hours=(value)
        split_and_create_wage_chunks(hours: value)
    end

    private

    def split_and_create_wage_chunks(hours: nil)
        # Don't set the hours unless they're different from the
        # computed hours
        return if hours == self.hours

        start_date = self.start_date
        end_date = self.end_date
        if start_date.blank? && end_date.blank?
            start_date = position.start_date
            end_date = position.end_date
        end

        return unless start_date && end_date

        assignment_hours = hours || position.hours_per_assignment
        return unless assignment_hours

        # TODO: Wage chunks should be reused if possible; that way
        # they preserve any reporting tags they may have.

        # Delete any old wage_chunks
        wage_chunks.destroy_all

        if end_date.year > start_date.year
            boundary_date = start_date.end_of_year
            assignment_hours_split = assignment_hours / 2.to_f
            wage_chunks.create!([{ start_date: start_date,
                                   end_date: boundary_date,
                                   hours: assignment_hours_split },
                                 { start_date: (boundary_date + 1.day)
                                               .beginning_of_year,
                                   end_date: end_date,
                                   hours: assignment_hours_split }])
        else
            wage_chunks.create!(start_date: start_date, end_date: end_date,
                                hours: assignment_hours)
        end
    end
end

# == Schema Information
#
# Table name: assignments
#
#  id                  :integer          not null, primary key
#  position_id         :integer          not null
#  applicant_id        :integer          not null
#  start_date          :datetime
#  end_date            :datetime
#  note                :text
#  offer_override_pdf  :string
#  active_offer_status :integer          default("0"), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  active_offer_id     :integer
#
# Indexes
#
#  index_assignments_on_active_offer_id               (active_offer_id)
#  index_assignments_on_applicant_id                  (applicant_id)
#  index_assignments_on_position_id                   (position_id)
#  index_assignments_on_position_id_and_applicant_id  (position_id,applicant_id) UNIQUE
#
