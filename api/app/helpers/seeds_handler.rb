module SeedsHandler
    include FakeData
    def request(action, path, params = nil)
        '''
        action: :get, :post, :put, :delete
        path: no need to include "/api/v1" portion of the route
        '''
        begin
            env = { method: action, params: params }
            mock_session = Rack::MockSession.new(Rails.application)
            session = Rack::Test::Session.new(mock_session)
            session.request("/api/v1#{path}", env)
            return JSON.parse(mock_session.last_response.body, symbolize_names: true)
        rescue JSON::ParserError
            error = "#{action.to_s.upcase} #{path} is an invalid path."
            return {status: 'error', message: error, payload: {}}
        end
    end

    def read_json(file, log)
        seed_data_dir = Rails.root.join('db', 'seed')
        file_dir = seed_data_dir+file
        begin
            data = File.read(file_dir)
            return JSON.parse(data, symbolize_names: true), log
        rescue Errno::ENOENT => e
            log.push(e)
            return [], log
        rescue JSON::ParserError 
            log.push("#{file_dir} is not a valid JSON file.")
            return [], log
        end
    end

    def insert_data(chaining, file: nil, templates: nil, entries: nil)
        log, records = [], {}
        if file
            json, log = read_json(file, log)
        elsif entries
            json, log = generate_mock_data(entries, log)
        end
        records = set_available_position_templates(templates, json, records)
        chaining, records = get_existing_records(chaining, records)
        p records
        puts log
    end

    def get_existing_records(chaining, records)
        chaining.each do |entry, i|
            route = entry[:get]
            entry[:label] = get_label(route)
            records[entry[:label]] = request(:get, route)[:payload]
        end
        return chaining, records
    end

    def get_label(route)
        return route.scan(/(\/)([\w_]+\Z)/)[0][1].to_sym
    end

    def set_available_position_templates(templates, json, records)
        if templates
            records[:available_position_templates] = templates
        else
            if json
                records[:available_position_templates] = json[:available_position_templates]
            end
        end
        return records
    end

    def generate_mock_data(entries, log)
        records = {}
        if entries
            keys = entries.keys
            entries.each_with_index do |entry, i|
                records[keys[i]] = []
                records[keys[i]]= generate(records, keys[i], entry)
            end
            return records, log
        else
            log.append('Error: Unspecified number of entries for mock data.')
            return {}, log
        end
    end
end
