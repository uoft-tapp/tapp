# frozen_string_literal: true

class PostingService
    include TransactionHandler
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
        custom_questions = @posting.custom_questions
        if custom_questions.respond_to? :dig
            fixed_survey['pages'].concat custom_questions['pages']
        end

        fixed_survey
    end

    # Prefills data based on the last application that
    # the `user` filled out.
    def prefill(user:)
        utorid = user.utorid
        applicant = Applicant.find_by(utorid: utorid)
        return { utorid: utorid } unless applicant

        {
            utorid: utorid,
            student_number: applicant.student_number,
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            email: applicant.email,
            phone: applicant.phone
        }
    end

    # Splits a Survey.js response object into the required pieces
    # (some of the data gets stored in database tables, some of it gets stored
    # as JSON blobs).
    def process_answers(user:, answers:)
        utorid = user.utorid

        answers = answers.to_hash.symbolize_keys

        # grab the applicant information
        applicant_attributes = answers
        rest =
            applicant_attributes.slice!(
                :email,
                :first_name,
                :last_name,
                :phone,
                :student_number
            )
        applicant_attributes[:utorid] = utorid
        # grab the application information
        application_attributes = rest
        rest =
            application_attributes.slice!(
                :comments,
                :department,
                :gpa,
                :previous_uoft_experience,
                :program
            )
        # the year in progress is computed backwards from the date
        if rest[:program_start]
            application_attributes[:yip] =
                ((Date.today - Date.parse(rest[:program_start])) / 356).floor +
                    1
        end
        application_attributes[:session] = @posting.session
        application_attributes[:posting] = @posting

        # Create the position preferences
        position_preferences_hash = rest[:position_preferences]
        rest.except!(:position_preferences)
        # Find the position_id and position_code of all items listed
        # in `position_preferences`. However, take special care to limit
        # to only positions that are actually associated with this posting
        # through a PostingPosition
        position_preferences_attributes =
            if position_preferences_hash
                PostingPosition.joins(:position).where(
                    position: { position_code: position_preferences_hash.keys },
                    posting: @posting
                ).pluck('position.id', 'position.position_code')
                    .map do |(position_id, position_code)|
                    {
                        position_id: position_id,
                        preference_level:
                            position_preferences_hash[position_code],
                        # These are needed so we can use the upsert method
                        created_at: DateTime.now,
                        updated_at: DateTime.now
                    }
                end
            else
                []
            end

        # Extract all the file upload questions
        @file_upload_answers = rest
        rest = @file_upload_answers.slice!(*file_upload_questions.map(&:to_sym))

        # Find if there's an existing applicant and associated application.
        @applicant = Applicant.find_or_initialize_by(utorid: utorid)
        application = @applicant.applications.find_by(posting: @posting)
        application_attributes[:id] = application.id if application

        # Everything left at this point is the answer to a custom question
        application_attributes[:custom_question_answers] = rest

        @applicant.attributes =
            applicant_attributes.merge(
                applications_attributes: [application_attributes]
            )
        @position_preferences_attributes = position_preferences_attributes
    end

    def save_answers!
        start_transaction_and_rollback_on_exception do
            @applicant.save!
            application = @applicant.applications.find_by(posting: @posting)
            # upsert_all will very efficiently upsert all the position preferences.
            unless @position_preferences_attributes.blank?
                PositionPreference.upsert_all(
                    @position_preferences_attributes.map do |a|
                        a.merge({ application_id: application.id })
                    end,
                    unique_by: %i[position_id application_id]
                )
            end
        end
        # Saving attachments cannot happen inside of a transaction.
        # See https://github.com/rails/rails/issues/41903
        application = @applicant.applications.find_by(posting: @posting)
        application.documents.purge
        application.documents.attach files_for_active_storage
    end

    private

    # We need to use the `posting_positions` to create
    def assemble_preferences_rows
        PostingPosition.joins(:position).where(posting: @posting).pluck(
            'positions.position_code',
            'positions.position_title'
        ).map do |(code, title)|
            { text: (title.blank? ? code : "#{code} - #{title}"), value: code }
        end
    end

    # Returns a list of all question ids for questions with a file upload
    def file_upload_questions
        nested_find(survey, 'type').filter do |obj|
            obj['type'] == 'file'
        end.map { |obj| obj['name'] }
    end

    # Active storage wants blobs formatted the format
    # { io: ..., filename: ..., content_type: ... }
    def files_for_active_storage
        @file_upload_answers.map do |key, objs|
            # objs should be an array of survey.js file objects.
            # A survey.js file object has feilds "name", "type", "content"
            objs.map do |survey_js_file|
                base_64_data = survey_js_file['content'].sub(/^data:.*,/, '')
                decoded_data = Base64.decode64(base_64_data)

                {
                    io: StringIO.new(decoded_data),
                    filename: "#{key}_#{survey_js_file['name']}",
                    content_type: survey_js_file['type'],
                    # without `identify: false`, rails will try to call various programs (e.g. ImageMagic)
                    # to analyze files. We don't have those programs installed, so we don't wan't rails erroring
                    # while trying to call them.
                    identify: false
                }
            end
        end.flatten
    end
end

# Recursively find all objects with the specified key.
# This function is modified from
# https://stackoverflow.com/questions/22720849/ruby-search-for-super-nested-key-from-json-response
def nested_find(obj, needed_key)
    return [] unless obj.is_a?(Array) || obj.is_a?(Hash)

    ret = []

    if obj.is_a?(Hash)
        ret.push obj if obj[needed_key]
        obj.each { |_hash, val| ret += nested_find(val, needed_key) }
    end
    obj.each { |val| ret += nested_find(val, needed_key) } if obj.is_a?(Array)
    ret
end
