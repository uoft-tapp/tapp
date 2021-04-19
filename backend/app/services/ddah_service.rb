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

            if duty_params[:duties]
                @ddah.duties_attributes =
                    duty_params[:duties].map do |duty|
                        # make sure all duties descriptions are normalized
                        # to start with the appropriate prefixes whenever duties are updated.
                        if duty[:description]
                            duty[:description] =
                                self.class.normalize_duty_desc duty[:description]
                        end
                        duty
                    end
            end

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

    # The April, 2021 collective agreement states that all duties must be categorized as
    # "meetings", "training", "preparation", "contact time", "other duties", "marking/grading".
    # Therefore, we will prefix all duties with "<duty>:" (the duty type followed by a colon)
    # so that a render can appropriately distinguish them.
    def normalized_duties
        @ddah.duties.order(:order).map { |duty| normalize_duty(duty: duty) }
    end

    def self.normalize_duty_desc(desc)
        if desc.match(/^prep.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'prep:')
        elsif desc.match(/^train.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'training:')
        elsif desc.match(/^meet.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'meeting:')
        elsif desc.match(/^contact.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'contact:')
        elsif desc.match(/^mark.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'mark:')
        elsif desc.match(/^grad.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'mark:')
        elsif desc.match(/^other.{0,15}:/i)
            trim_replace(desc, $~.to_s, 'other:')
        else
            "other:#{desc.strip}"
        end
    end

    private

    def normalize_duty(duty:)
        duty.description = self.class.normalize_duty_desc duty.description
        duty
    end

    def self.trim_replace(orig, prefix, desired_prefix)
        # If the prefix is already the desired prefix and it's not followed
        # by a space, we're all good
        return orig if prefix == desired_prefix && !Regexp.new("^#{prefix}\\s")

        "#{desired_prefix}#{orig.sub(Regexp.new("^#{prefix}"), '').strip}"
    end

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
