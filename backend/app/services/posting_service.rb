# frozen_string_literal: true

class PostingService
    include TransactionHandler
    attr_reader :posting, :application

    def initialize(params: nil, posting: nil)
        @params = params
        @posting = posting
    end

    # Assemble a survey for the posting
    def survey
        fixed_survey =
            JSON.parse File.read(Rails.root.join('app', 'data', 'survey.json'))
        position_description_template =
            Liquid::Template.parse(
                File.read(
                    Rails.root.join('app', 'data', 'position_descriptions.html')
                )
            )

        # Set the global survey title
        availability_desc =
            if @posting.open_date.year == @posting.close_date.year
                "Available from #{@posting.open_date.strftime('%b %d')} to #{
                    @posting.close_date.strftime('%b %d, %Y')
                }"
            else
                "Available from #{
                    @posting.open_date.strftime('%b %d, %Y')
                } to #{@posting.close_date.strftime('%b %d, %Y')}"
            end
        fixed_survey['title'] = "#{@posting.name} (#{availability_desc})"
        fixed_survey['description'] = @posting.intro_text

        # Find the preferences page and set a preference for each PostingPosition
        preferences_page =
            fixed_survey['pages'].find do |page|
                page['name'] == 'preferences_page'
            end

        preferences_question =
            preferences_page['elements'].find do |elm|
                elm['name'] == 'position_preferences'
            end
        preferences_question['rows'] = assemble_preferences_rows
        position_descriptions =
            preferences_page['elements'].find do |elm|
                elm['name'] == 'position_descriptions'
            end
        position_descriptions['html'] =
            position_description_template.render position_description_subs

        # Add any custom questions there may be.
        # These should show up after all fixed questions but before the comments page.
        custom_questions = @posting.custom_questions
        custom_pages =
            custom_questions.respond_to?(:dig) ? custom_questions['pages'] : []

        comments_page, fixed_pages =
            fixed_survey['pages'].partition do |page|
                page['name'] == 'comments_page'
            end

        fixed_survey['pages'] = fixed_pages + custom_pages + comments_page

        fixed_survey
    end

    # Prefills data based on the last application that
    # the `user` filled out.
    def prefill(user:)
        utorid = user.utorid
        applicant = Applicant.find_by(utorid: utorid)
        return { utorid: utorid } unless applicant

        # This is the basic data we can get if the applicant already exists
        data = {
            utorid: utorid,
            student_number: applicant.student_number,
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            email: applicant.email,
            phone: applicant.phone
        }

        existing_application =
            Application.find_by(posting: @posting, applicant: applicant)
        if existing_application
            application_service =
                ApplicationService.new application: existing_application
            data.merge! application_service.prefilled_data
        else
            # Find out if they have previous contracts in the database.
            # This will tell us information about whether the applicant has been previously employed
            offer_history =
                Assignment.joins(:applicant, :offers, :position).where(
                    applicant: applicant, "offers.status": 'accepted'
                ).order("offers.position_start_date": :ASC).pluck(
                    :"positions.position_code",
                    :"offers.hours",
                    :"offers.position_start_date",
                    :"offers.position_end_date"
                )
            unless offer_history.blank?
                data[:previous_department_ta] = true
                data[:previous_university_ta] = true
                # Technically we cannot infer this, but if they've TAed for the department
                # before, we don't care about other history
                data[:previous_other_university_ta] = false
                data[:previous_experience_summary] =
                    offer_history
                        .map do |(course, hours, start_date, end_date)|
                        "#{course} (#{hours} hours) from #{
                            start_date.strftime('%b %Y')
                        } to #{end_date.strftime('%b %Y')}"
                    end.join '; '
            end

            # Some information rarely changes from application to application.
            # For example, the program of study/department/program start.
            # We retrieve this information from the most recently completed application
            # if it's available.
            last_application =
                Application.joins(:applicant).where(applicant: applicant).order(
                    updated_at: :DESC
                ).first
            application_service =
                ApplicationService.new application: last_application
            last_application_data = application_service.prefilled_data
            data.merge! last_application_data.slice(
                            :department,
                            :program,
                            :program_start
                        ).compact
        end

        data
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
                :previous_experience_summary,
                :previous_department_ta,
                :previous_university_ta,
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
        if !(position_preferences_hash.is_a? Hash) &&
               !position_preferences_hash.nil?
            raise StandardError,
                  "Unknown format of position_preferences: '#{
                      position_preferences_hash
                  }'"
        end
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
        @application = @applicant.applications.find_by(posting: @posting)
        @application.documents.purge
        @application.documents.attach files_for_active_storage
    end

    private

    # Assemble JSON that can be used to do the substitutions in a liquid template.
    def position_description_subs
        {
            'positions' =>
                PostingPosition.joins(:position).where(posting: @posting).order(
                    :'positions.position_code'
                ).pluck(
                    'positions.position_code',
                    'positions.position_title',
                    'positions.duties',
                    'positions.qualifications',
                    'hours',
                    'num_positions'
                )
                    .map do |(code, title, duties, qualifications, hours, num_positions)|
                    {
                        position_code: code,
                        position_title: title,
                        duties: duties,
                        qualifications: qualifications,
                        hours: hours,
                        num_positions: num_positions
                    }.stringify_keys
                end
        }
    end

    # We need to use the `posting_positions` to create
    def assemble_preferences_rows
        PostingPosition.joins(:position).where(posting: @posting).order(
            :'positions.position_code'
        ).pluck('positions.position_code', 'positions.position_title')
            .map do |(code, title)|
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
