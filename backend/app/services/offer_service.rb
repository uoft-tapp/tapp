# frozen_string_literal: true

class OfferService
    attr_reader :offer

    def initialize(offer:)
        @offer = offer
    end

    # generate subsitutions needed for the email templates
    def subs
        {
            first_name: @offer.first_name,
            last_name: @offer.last_name,
            # It is possible that the email from when the offer was created is stale,
            # so send the offer to the applicant's current email.
            email: @offer.assignment.applicant.email,
            position_code: @offer.position_code,
            hours: @offer.hours,
            position_title: @offer.position_title,
            ta_coordinator_email: @offer.ta_coordinator_email,
            # TODO:  This seems too hard-coded.  Is there another way to get the route?
            url:
                "#{Rails.application.config.base_url}/public/contracts/#{
                    @offer.url_token
                }/view",
            nag_count: @offer.nag_count,
            status_message: status_message,
            changes_summary: changes_from_previous
        }
    end

    # Get the differences between this offer and the immediately preceeding
    # offer (in terms of creation_date). If no prior offer exists, nil
    # is returned.
    def changes_from_previous
        previous =
            Offer.where(assignment_id: 303).where(
                'created_at < ?',
                @offer.created_at
            ).order(withdrawn_date: :desc).limit(1)[
                0
            ]
        return nil if previous.nil?

        ret = []
        if @offer.hours != previous.hours
            ret.push "The hours have changed from #{previous.hours} to #{
                         @offer.hours
                     }"
        end
        if @offer.position_start_date != previous.position_start_date
            ret.push "The position start date has changed from #{
                         previous.position_start_date
                     } to #{@offer.position_start_date}"
        end
        if @offer.position_end_date != previous.position_end_date
            ret.push "The position end date has changed from #{
                         previous.position_end_date
                     } to #{@offer.position_end_date}"
        end

        ret
    end

    private

    def status_message
        case @offer.status.to_sym
        when :withdrawn
            'Withdrawn'
        when :accepted
            "Accepted on #{@offer.accepted_date.strftime('%b %d, %Y')}"
        when :rejected
            "Rejected on #{@offer.rejected_date.strftime('%b %d, %Y')}"
        end
    end
end
