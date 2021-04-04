# frozen_string_literal: true

class PostingService
    attr_reader :posting

    def initialize(params: nil, posting: nil)
        @params = params
        @posting = posting
    end

    # Assemble a survey for the posting
    def survey
        fixed_survey =
            JSON.parse File.read(Rails.root.join('app', 'data', 'survey.json'))

        # Set the global survey title
        fixed_survey['title'] = @posting.name
        fixed_survey['description'] = @posting.intro_text

        # Find the preferences page and set a preference for each PostingPosition
        preferences_page =
            fixed_survey['pages'].find do |page|
                page['name'] == 'preferences_page'
            end

        preferences_page['elements'][0]['rows'] = assemble_preferences_rows

        # Add any custom questions there may be
        custom_questions = JSON.parse @posting.custom_questions
        if custom_questions.respond_to? :dig
            fixed_survey['pages'].concat custom_questions['pages']
        end

        fixed_survey
    end

    private

    # We need to use the `posting_positions` to create
    def assemble_preferences_rows
        PostingPosition
            .joins(:position)
            .where(posting: @posting)
            .pluck('positions.position_code', 'positions.position_title')
            .map do |(code, title)|
                {
                    text: (title.blank? ? code : "#{code} - #{title}"),
                    value: code
                }
            end
    end
end
