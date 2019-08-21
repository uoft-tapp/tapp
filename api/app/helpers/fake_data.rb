module FakeData
    def generate(records, entry, num_entries)
        entries = []
        gen_entry_fn = generate_fn(entry)
        if not gen_entry_fn 
            return entries
        end
        (1..num_entries).each do |i|
            data, records = gen_entry_fn.call(records)
            while existing_entry(entries, data, entry)
                data, records = gen_entry_fn.call(records)
            end
            entries.push(data)
        end
        return entries
    end

    private
    def existing_entry(entries, data, type)
        entries.each do |item|
            if matching_entry(type, data, item)
                return true
            end
        end
        return false
    end

    def matching_entry(type, data, item)
        index_on(type).each do |key|
            if item[key] != data[key]
                return false
            end
        end
        return true
    end

    def index_on(entry)
        case entry
        when :sessions
            return [:name]
        when :position_templates
            return [:session_index, :position_type]
        when :positions
            return [:session_index, :position_code]
        when :instructors
            return [:utorid]
        when :applicants
            return [:utorid]
        when :applications
            return [:session_index, :applicant_index]
        when :preferences
            return [:application_index, :position_index]
        when :assignments
            return [:position_index, :applicant_index]
        when :wage_chunks
            return [:assignment_index]
        when :reporting_tags
            return [:wage_chunk_index]
        else
            return []
        end
    end

    def generate_fn(entry)
        case entry
        when :sessions
            return Proc.new do |records|
                create_session(records)
            end
        when :position_templates
            return Proc.new do |records|
                create_position_template(records)
            end
        when :positions
            return Proc.new do |records|
                create_position(records)
            end
        when :instructors
            return Proc.new do |records|
                create_instructor(records)
            end
        when :applicants
            return Proc.new do |records|
                create_applicant(records)
            end
        when :applications
            return Proc.new do |records|
                create_application(records)
            end
        when :preferences
            return Proc.new do |records|
                create_preference(records)
            end
        when :assignments
            return Proc.new do |records|
                create_assignment(records)
            end
        when :wage_chunks
            return Proc.new do |records|
                create_wage_chunk(records)
            end
        when :reporting_tags
            return Proc.new do |records|
                create_reporting_tag(records)
            end
        else
            return nil
        end
    end

    def create_session(records)
        if not records[:session]
            records[:session] = 0
            records[:year] = Time.now.year
        else
            records[:session] += 1
        end
        rate1 = Faker::Number.normal(50, 3.5).to_d.truncate(2).to_f
        rate2 = Faker::Number.normal(50, 3.5).to_d.truncate(2).to_f
        case records[:session]%4
        when 0
            return {
                name: "#{records[:year]} Fall",
                start_date: Time.new(records[:year], 9, 1),
                end_date: Time.new(records[:year], 12, 31),
                rate1: rate1,
                rate2: nil,
            }, records
        when 1
            return {
                name: "#{records[:year]} Winter",
                start_date: Time.new(records[:year], 1, 1),
                end_date: Time.new(records[:year], 4, 30),
                rate1: rate1,
                rate2: nil,
            }, records
        when 2
            return {
                name: "#{records[:year]} Summer",
                start_date: Time.new(records[:year], 5, 1),
                end_date: Time.new(records[:year], 8, 31),
                rate1: rate1,
                rate2: nil,
            }, records
        else
            records[:year] += 1
            return {
                name: "#{records[:year]-1}-#{records[:year]} Fall-Winter",
                start_date: Time.new(records[:year]-1, 9, 1),
                end_date: Time.new(records[:year], 4, 30),
                rate1: rate1,
                rate2: rate2,
            }, records
        end
    end

    def available_position_templates
        env = { method: :get }
        mock_session = Rack::MockSession.new(Rails.application)
        session = Rack::Test::Session.new(mock_session)
        session.request('/api/v1/available_position_templates', env)
        return JSON.parse(mock_session.last_response.body, symbolize_names: true)[:payload]
    end

    def create_position_template(records)
        if not records.include?(:available_position_templates)
            records[:available_position_templates] = available_position_templates
        end
        session_index = rand_index(records, :sessions)
        idx = rand_index(records, :available_position_templates)
        template = records[:available_position_templates][idx]
        return {
            position_type: Faker::Lorem.word,
            offer_template: template[:offer_template],
            session_index: session_index,
        }, records
    end

    def create_position(records)
        session_index = rand_index(records, :position_templates, :session_index)
        course = Faker::Educator.course_name
        session = get_record(records, :sessions, session_index)
        position_template = rand_entry(records, :position_templates, :session_index, session_index)
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
            session_index: session_index,
            ad_hours_per_assignment: hours,
            ad_num_assignments: num_assignments,
            ad_open_date: open_date,
            ad_close_date: close_date,
            duties: Faker::Lorem.paragraph,
            qualifications: Faker::Lorem.paragraph,
            desired_num_assignments: num_assignments,
            current_enrollment: enrollment,
            current_waitlisted: Faker::Number.between(0, (enrollment*0.3).floor),
            instructor_indexes: rand_instructors(records)
        }, records
    end

    def create_instructor(records)
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
        }, records
    end

    def create_applicant(records)
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
        }, records
    end

    def create_application(records)
        session_index = rand_index(records, :sessions)
        applicant_index = rand_index(records, :applicants)
        return {
            comments: Faker::Lorem.paragraph,
            program: program,
            department: Faker::Educator.subject,
            previous_uoft_ta_experience: Faker::Lorem.paragraph,
            yip: Faker::Number.between(1, 10),
            annotation: Faker::Lorem.paragraph,
            session_index: session_index,
            applicant_index: applicant_index,
        }, records
    end

    def create_preference(records)
        position_index = rand_index(records, :positions)
        application_index = rand_index(records, :applications)
        return {
            position_index: position_index,
            application_index: application_index,
            preference_level: Faker::Number.between(1, 10),
        }, records
    end

    def create_assignment(records)
        position_index = rand_index(records, :positions)
        applicant_index = rand_index(records, :applicants)
        position = get_record(records, :positions, position_index)
        dir = "#{Rails.root}/app/views/position_templates/"
        options = [nil, "#{dir}#{Faker::Lorem.word}.pdf"]
        return {
            contract_start: position[:est_start_date],
            contract_end: position[:est_end_date],
            note: Faker::Lorem.paragraph,
            offer_override_pdf: rand_element(options),
            position_index: position_index,
            applicant_index: applicant_index,
        }, records
    end

    def create_wage_chunk(records)
        assignment_index = rand_index(records, :assignments)
        assignment = get_record(records, :assignments, assignment_index)
        position = get_record(records, :positions, assignment[:position_index])
        session = get_record(records, :sessions, position[:session_index])
        return {
            start_date: assignment[:contract_start],
            end_date: assignment[:contract_end],
            hours: position[:est_hours_per_assignment],
            rate: session[:rate2] ? (session[:rate1]+session[:rate2])/2 : session[:rate1],
            assignment_index: assignment_index,
        }, records
    end

    def create_reporting_tag(records)
        wage_chunk_index = rand_index(records, :wage_chunks)
        wage_chunk = get_record(records, :wage_chunks, wage_chunk_index)
        assignment = get_record(records, :assignments, wage_chunk[:assignment_index])
        position = get_record(records, :positions, assignment[:position_index])
        return {
            name: position[:position_code][0..-5],
            position_index: assignment[:position_index],
            wage_chunk_index: wage_chunk_index,
        }, records
    end

    def rand_index(records, attribute, subattribute = nil)
        if subattribute
            indexes = records[attribute].map do |entry|
                entry[subattribute]
            end
            idx = Faker::Number.between(0, indexes.length-1)
            return indexes[idx]
        else
            return Faker::Number.between(0, records[attribute].length-1)
        end
    end

    def rand_element(array)
        idx = Faker::Number.between(0, array.length-1)
        return array[idx]
    end

    def program
        programs = ['PhD', 'MSc', 'MScAC', 'MASc', 'MEng', 'OG', 'PostDoc', 'UG', 'Other']
        return rand_element(programs)
    end

    def rand_instructors(records)
        selected = []
        num_positions = rand_index(records, :instructors)
        (0..num_positions).each do |i|
            chosen = rand_index(records, :instructors)
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

    def get_record(records, table, id)
        if id >= 0 and id < records[table].length
            return records[table][id]
        else
            return nil
        end
    end

    def get_matches(records, table, attribute, value)
        matches = []
        records[table].each_with_index do |entry|
            if entry[attribute] == value
                matches.push(entry)
            end
        end
        return matches
    end

    def rand_entry(records, table, attribute, value)
        entries = get_matches(records, table, attribute, value)
        if entries.length > 0
            return rand_element(entries)
        else
            return nil
        end
    end
end
