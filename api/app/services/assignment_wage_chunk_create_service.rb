# frozen_string_literal: true

class AssignmentWageChunkCreateService
    RETURNING_VALUES = %w[id hours rate start_date end_date].freeze

    attr_reader :assignment
    attr_accessor :wage_chunks

    def initialize(assignment:, wage_chunk_params:)
        @assignment = assignment
        @wage_chunks = wage_chunk_params
        @returned_wage_chunks ||= []
    end

    def perform
        delete_existing_wage_chunks
        add_missing_wage_chunk_attrs
        @returned_wage_chunks = upsert_and_return_wage_chunks
    end

    def values
        @returned_wage_chunks
    end

    private

    def delete_existing_wage_chunks
        # TODO: Array of ID's passed in -- delete the ones not referenced in the list
        # ids = @wage_chunks.fetch(:id)
        @assignment.wage_chunks.where(id: ids).not.delete_all
    end

    def add_missing_wage_chunk_attrs
        raise AssignmentWageChunkCreateService::WageChunkMissing if @wage_chunks.blank?

        # TODO: Reference GitHub work around issue here
        @wage_chunks = @wage_chunks.map do |x|
            time = Time.zone.now
            x.to_h.merge!(assignment_id: @assignment.id,
                          created_at: time,
                          updated_at: time)
        end
    end

    def upsert_and_return_wage_chunks
        @assignment.wage_chunks
                   .upsert_all(@wage_chunks,
                               returning: RETURNING_VALUES)
    end

    class WageChunkMissing < StandardError
        def message
            I18n.t('assignment_wage_chunk_service.wage_chunk_missing.message')
        end
    end
end
