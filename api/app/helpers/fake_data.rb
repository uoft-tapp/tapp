module FakeData
    def generate(entry)
        case entry
        when :sessions
            return session
        when :available_position_templates
            return available_position_template
        when :position_templates
            return position_template
        when :positions
            return position
        when :instructors
            return instructor
        when :applicants
            return applicant
        when :applications
            return application
        when :preferences
            return preference
        when :assignments
            return assignment
        when :wage_chunks
            return wage_chunk
        when :reporting_tags
            return reporting_tag
        else
            return nil
        end
    end

    private
    def session
        if not @session
            @session = 0
            @year = Time.now.year
        else
            @session += 1
        end
        rate1 = Faker::Number.normal(50, 3.5).to_d.truncate(2).to_f
        rate2 = Faker::Number.normal(50, 3.5).to_d.truncate(2).to_f
        case @session%4
        when 0
            return {
                name: "#{@year} Fall",
                start_date: Time.new(@year, 9, 1),
                end_date: Time.new(@year, 12, 31),
                rate1: rate1,
                rate2: nil,
            }
        when 1
            return {
                name: "#{@year} Winter",
                start_date: Time.new(@year, 1, 1),
                end_date: Time.new(@year, 4, 30),
                rate1: rate1,
                rate2: nil,
            }
        when 2
            return {
                name: "#{@year} Summer",
                start_date: Time.new(@year, 5, 1),
                end_date: Time.new(@year, 8, 31),
                rate1: rate1,
                rate2: nil,
            }
        else
            @year += 1
            return {
                name: "#{@year-1}-#{@year} Fall-Winter",
                start_date: Time.new(@year-1, 9, 1),
                end_date: Time.new(@year, 4, 30),
                rate1: rate1,
                rate2: rate2,
            }
        end
    end

    def available_position_template
        dir = "#{Rails.root}/app/views/position_templates/"
        return "#{dir}#{Faker::Lorem.word}.erb"
    end

    def position_template
        session_id = rand_index(:sessions)
        idx = rand_index(:available_position_templates)
        template = @record[:available_position_templates][idx]
        return {
            position_type: Faker::Lorem.word,
            offer_template: template,
            session_id: session_id,
        }
    end

    def position
        session_id = rand_index(:sessions)
        course = Faker::Educator.course_name
        session = get_record(:sessions, session_id)
        position_template = rand_entry(:position_templates, :session_id, session_id)
        semester = get_semester_type(session)
        hours = Faker::Number.between(50, 80)
        num_assignments = Faker::Number.between(3, 15)
        enrollment = Faker::Number.between(70, 1200)
        open_date, close_date = open_close_date(session)
        return {
            position_code: course[0..2].upcase+course[-3..-1]+semester,
            position_title: course,
            est_hours_per_assignment: hours,
            est_start_date: session[:start_date],
            est_end_date: session[:end_date],
            position_type: position_template[:position_type],
            session_id: session_id,
            ad_hours_per_assignment: hours,
            ad_num_assignments: num_assignments,
            ad_open_date: open_date,
            ad_close_date: close_date,
            duties: Faker::Lorem.paragraph,
            qualifications: Faker::Lorem.paragraph,
            desired_num_assignments: num_assignments,
            current_enrollment: enrollment,
            current_waitlisted: Faker::Number.between(0, (enrollment*0.3).floor),
            instructor_ids: rand_instructors
        }
    end

    def instructor
        first_name = Faker::Name.first_name
        last_name = Faker::Name.last_name
        ln = last_name.length > 3 ? last_name[0..2] : last_name
        fn = first_name.length > 3 ? first_name[0..2] : first_name
        return {
            first_name: first_name,
            last_name: last_name,
            email: Faker::Internet.email("#{first_name} #{last_name}", ''),
            utorid: Faker::Internet.slug(
                "#{ln} #{fn} #{Faker::Number.number(2)}", ''),
        }
    end

    def applicant
        first_name = Faker::Name.first_name
        last_name = Faker::Name.last_name
        ln = last_name.length > 3 ? last_name[0..2] : last_name
        fn = first_name.length > 3 ? first_name[0..2] : first_name
        utorid = Faker::Internet.slug("#{ln} #{fn} #{Faker::Number.number(2)}", '')
        return {
            first_name: first_name,
            last_name: last_name,
            email: Faker::Internet.email("#{utorid}", ''),
            utorid: utorid,
            phone: Faker::PhoneNumber.phone_number,
            student_number: Faker::Number.number(10),
        }
    end

    def application
        session_id = rand_index(:sessions)
        applicant_id = rand_index(:applicants)
        return {
            comments: Faker::Lorem.paragraph,
            program: program,
            department: Faker::Educator.subject,
            previous_uoft_ta_experience: Faker::Lorem.paragraph,
            yip: Faker::Number.between(1, 10),
            annotation: Faker::Lorem.paragraph,
            session_id: session_id,
            applicant_id: applicant_id,
        }
    end

    def preference
        position_id = rand_index(:positions)
        application_id = rand_index(:applications)
        return {
            position_id: position_id,
            application_id: application_id,
            preference_level: Faker::Number.between(1, 10),
        }
    end

    def assignment
        position_id = rand_index(:positions)
        applicant_id = rand_index(:applicants)
        position = get_record(:positions, position_id)
        dir = "#{Rails.root}/app/views/position_templates/"
        options = [nil, "#{dir}#{Faker::Lorem.word}.pdf"]
        return {
            contract_start: position[:est_start_date],
            contract_end: position[:est_end_date],
            note: Faker::Lorem.paragraph,
            offer_override_pdf: rand_element(options),
            position_id: position_id,
            applicant_id: applicant_id,
        }
    end

    def wage_chunk
        assignment_id = rand_index(:assignments)
        assignment = get_record(:assignments, assignment_id)
        position = get_record(:positions, assignment[:position_index])
        session = get_record(:sessions, position[:session_index])
        return {
            start_date: assignment[:contract_start],
            end_date: assignment[:contract_end],
            hours: position[:est_hours_per_assignment],
            rate: session[:rate2] ? (session[:rate1]+session[:rate2])/2 : session[:rate1],
            assignment_index: assignment_id,
        }
    end

    def reporting_tag
        wage_chunk_id = rand_index(:wage_chunks)
        wage_chunk = get_record(:wage_chunks, wage_chunk_id)
        assignment = get_record(:assignments, wage_chunk[:assignment_index])
        position = get_record(:positions, assignment[:position_index])
        return {
            name: position[:position_code][0..-5],
            position_index: assignment[:position_index],
            wage_chunk_index: wage_chunk_id,
        }
    end

    def rand_index(attribute)
        return Faker::Number.between(0, @record[attribute].length-1)
    end

    def rand_element(array)
        idx = Faker::Number.between(0, array.length-1)
        return array[idx]
    end

    def program
        programs = ['PhD', 'MSc', 'MScAC', 'MASc', 'MEng', 'OG', 'PostDoc', 'UG', 'Other']
        return rand_element(programs)
    end

    def rand_instructors
        selected = []
        num_positions = rand_index(:instructors)
        (0..num_positions).each do |i|
            chosen = rand_index(:instructors)
            if not selected.include?(chosen)
                selected.push(chosen)
            end
        end
        return selected
    end

    def get_semester_type(session)
        start = session[:start_date]
        if matching_month(start, 1)
            return 'H1-S'
        else
            if matching_month(session[:end_date], 12) or 
                matching_month(session[:end_date], 7)
                return 'H1-F'
            else
                return 'Y1-Y'
            end
        end
    end

    def open_close_date(session)
        start = session[:start_date]
        year = get_date_attr(start, :year)
        if matching_month(start, 9)
            return Time.new(year, 8, 1), Time.new(year, 8, 31)
        elsif matching_month(start, 5)
            return Time.new(year, 4, 1), Time.new(year, 4, 30)
        else
            return Time.new(year-1, 12, 1), Time.new(year-1, 12, 31)
        end
    end

    def get_date_attr(date, attribute)
        date = Date.parse(date.to_s)
        case attribute
        when :year 
            return date.year
        when :month
            return date.month
        when :day
            return date.day
        else
            return date
        end
    end

    def matching_month(date, month)
        return get_date_attr(date, :month) == month
    end

    def get_record(table, id)
        @record[table].each do |entry|
            if entry[:id] == id
                return entry
            end
        end
        return nil
    end

    def get_matches(table, attribute, value)
        matches = []
        @record[table].each do |entry|
            if entry[attribute] == value
                matches.push(entry)
            end
        end
        return matches
    end

    def rand_entry(table, attribute, value)
        entries = get_matches(table, attribute, value)
        if entries.length > 0
            return rand_element(entries)
        else
            return nil
        end
    end
end
