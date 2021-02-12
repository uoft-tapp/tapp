# frozen_string_literal: true

class DdahService
    include TransactionHandler
    attr_reader :ddah

    def initialize(params: nil, ddah: nil)
        @params = params
        @ddah = ddah
    end

    def update!
        start_transaction_and_rollback_on_exception do
            @ddah.update!(ddah_params)
            if duty_params[:duties] && @ddah.duties
                # Save the old duties to detect if they get changed
                old_duties = @ddah.duties.as_json(only: %i[description hours])

                # if we specified duties, delete the old ones and add the new ones
                @ddah.duties.destroy_all
            end
            @ddah.duties_attributes = duty_params[:duties] if duty_params[
                :duties
            ]

            # If the duties changed, we need to modify some attributes
            if @ddah.duties.as_json(only: %i[description hours]) != old_duties
                if @ddah.emailed_date || @ddah.accepted_date
                    @ddah.revised_date = Time.zone.now
                end
                @ddah.approved_date = nil
                @ddah.accepted_date = nil
                @ddah.signature = nil
            end

            @ddah.save!
        end
    end

    private

    def ddah_params
        @params.slice(
            :assignment_id,
            :approved_date,
            :accepted_date,
            :revised_date,
            :emailed_date,
            :signature
        ).permit!
    end

    def duty_params
        @params.slice(:duties).permit(duties: %i[order hours description])
    end
end
