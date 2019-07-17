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
            json[key].each do |data|
                data = replace_if_exists(json, data, records[key], entry[:unique])
                data = replace_all_index(json, data)
                route = get_route(entry[:create], data)
                res = request(:post, route, data)
                if res[:status] == 'sucess'
                    
                else
                    break
                end
            end
        end
        return log
    end

    def get_route(route, data)
        keys = route.scan(/(:[\w\_]+)/)
        keys.each do |key|
            key = key[0]
            label = key.gsub(':', '').to_sym
            route = route.gsub(key, data[label])
        end
        return route
    end

    def replace_if_exists(json, data, records, unique)
        records.each do |entry|
            data, matching = matching_entry(json, data, entry, unique)
            if matching
                data[:id] = entry[:id]
                return
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

    def matching_entry(json, data, entry, unique)
        unique.each do |key|
            if is_index(key)
                data, id_name = sub_out_index(data, json, key)
                if data[id_name] != entry[id_name]
                    return false, data
                end
            else
                if data[key] != entry[key]
                    return false, data
                end
            end
        end
        return true, data
    end

    def sub_out_index(data, json, key)
        id_name = id_name(key)
        table = table_key(key)
        if data[key].kind_of?(Array)
            data[id_name] = data[key].map do |entry|
                json[table][entry][:id]
            end
        else
            data[id_name] = json[table][data[key]][:id]
            data.delete(key)
        end
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
        return key.to_s.scan(/(_index)/).length > 0
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
