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
        chaining, records = get_existing_records(chaining, records)
        if file
            json, log = read_json(file, log)
        elsif entries
            json, log = generate_mock_data(entries, log)
        end
        records = set_available_position_templates(templates, json, records)
        log = post_data(chaining, json, records, log)
        puts log
    end

    def post_data(chaining, json, records, log)
        chaining.each do |entry|
            key = entry[:label]
            table_data = []
            error_count = 0
            json[key].each do |data|
                data = replace_all_index(json, data)
                data = add_id_to_existing_record(data, records[key], entry[:unique])
                route = get_route(entry[:create], data)
                if data.include?(:id)
                    route = entry[:get]
                end
                res = request(:post, route, data)
                if res[:status] == 'success'
                    if array_result(route)
                        table_data.push(get_entry(data, res[:payload], entry[:unique]))
                    else
                        table_data.push(res[:payload])
                    end
                else
                    log.push(res[:message])
                    table_data.push(nil)
                    error_count+=1
                end
            end
            json[key] = table_data
            if error_count == 0
                log.push("Insertions/updates to the table #{key} were successful.")
            else
                log.push("There were errors with the insertion/update to table #{key}.")
            end
        end
        return log
    end

    def get_entry(data, result, unique)
        result.each do |entry|
            if match_all_unique_keys(data, entry, unique)
                return entry
            end
        end
    end

    def match_all_unique_keys(data, entry, unique)
        unique.each do |key|
            if is_index(key)
                key = id_name(key)
            end
            if data[key] != entry[key]
                return false
            end
        end
        return true
    end

    def array_result(route)
        return route.scan(/(\/add_)/).length > 0
    end

    def get_route(route, data)
        keys = route.scan(/(:[\w\_]+)/)
        keys.each do |key|
            key = key[0]
            label = key.gsub(':', '').to_sym
            route = route.gsub(key, data[label].to_s)
        end
        return route
    end

    def add_id_to_existing_record(data, records, unique)
        records.each do |entry|
            if match_all_unique_keys(data, entry, unique)
                data[:id] = entry[:id]
                return data
            end
        end
        return data
    end

    def replace_all_index(json, data)
        data.keys.each do |key|
            if is_index(key)
                data, _ = sub_out_index(data, json, key)
            end
        end
        return data
    end

    def sub_out_index(data, json, key)
        id_name = id_name(key)
        table = table_key(key)
        if data[key].kind_of?(Array)
            data[id_name] = data[key].map do |entry|
                json[table][entry][:id]
            end
        elsif data[key]
            data[id_name] = json[table][data[key]][:id]
        end
        data.delete(key)
        return data, id_name
    end

    def id_name(key)
        temp = key.to_s.gsub(/(_indexes|_index)/) { |m| m == '_index' ? '_id' : '_ids' }
        return temp.to_sym
    end

    def table_key(key)
        return key.to_s.gsub(/(_indexes|_index)/, 's').to_sym
    end

    def is_index(key)
        return key.to_s.scan(/(_indexes|_index)/).length > 0
    end

    def is_id(key)
        return key.to_s.scan(/(_id)/).length > 0
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
            entries.keys.each do |key|
                records[key] = []
                records[key]= generate(records, key, entries[key])
            end
            return records, log
        else
            log.append('Error: Unspecified number of entries for mock data.')
            return {}, log
        end
    end
end
