module SeedsHandler
    include FakeData
    def request(action, path, params = nil)
        '''
        Returns the result of calling the API path using action and given params

        action: :get, :post, :put, :delete
        path: no need to include "/api/v1" portion of the route
        params: body of API call
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

    def read_json(file)
        '''
        Returns a JSON with the file content 

        file: located relative to seed_data_dir
        '''
        seed_data_dir = Rails.root.join('db', 'seed')
        file_dir = seed_data_dir+file
        begin
            data = File.read(file_dir)
            return JSON.parse(data, symbolize_names: true)
        rescue Errno::ENOENT => e
            @log.push(e)
            return {}
        rescue JSON::ParserError 
            @log.push("#{file_dir} is not a valid JSON file.")
            return {}
        end
    end

    def insert_data(seed_data_sequence, file)
        '''
        Inserts JSON mock data into the routes defined in seed_data_sequence.

        seed_data_sequence: an array with JSON as elements. Each element contains
            get: route to get all entries for a table
            create: route to create an entry in a specific table
            index_on: an array of attributes that makes an entry unique in a table
        file: JSON file name containg seed data to be inserted
        '''
        @log = []
        empty_db = empty_records(seed_data_sequence)
        if empty_db
            if file
                json = read_json(file)
                valid_templates = check_templates(json)
                if valid_templates
                    post_data(seed_data_sequence, json)
                end
            else
                @log.push('No JSON file was given.')
            end
        end
        puts @log
    end
 
    def empty_records(seed_data_sequence)
        '''
        Return whether or not the db is empty
        '''
        seed_data_sequence.each do |entry, i|
            res = request(:get, entry[:get])[:payload]
            if res.length > 0
                @log.push('Database has not been cleared.')
                return false
            end
        end
        return true
    end

    def check_templates(json)
        '''
        Return whether or not the templates in the JSON file is valid
        '''
        templates = request(:get, '/available_position_templates')[:payload]
        json[:position_templates].each do |entry|
            data = {
                offer_template: entry[:offer_template]
            }
            if not templates.include?(data)
                @log.push("Invalid position_template: #{entry[:offer_template]}")
                return false
            end
        end
        return true
    end

    def post_data(seed_data_sequence, json)
        '''
        Insert json data according to seed_data_sequence 
        '''
        insert_error = false
        seed_data_sequence.each do |entry|
            break if insert_error
            key = entry[:label]
            table_data, errors = [], []
            json[key].each do |data|
                data = replace_all_index(json, data)
                route = get_route(entry[:create], data)
                res = request(:post, route, data)
                if res[:status] == 'success'
                    if array_result(route)
                        table_data.push(get_entry(data, res[:payload], entry[:index_on]))
                    else
                        table_data.push(res[:payload])
                    end
                else
                    errors.push(res[:message])
                    table_data.push({})
                    insert_error = true
                end
                break if insert_error
            end
            json[key] = table_data
            if errors.length == 0
                @log.push("Insertions/updates to the table #{key} were successful.")
            else
                @log.push("There were errors with the insertion/update to #{key}.")
                @log += errors.map do |entry|
                    entry = "\t"+entry
                end
            end
        end
    end

    def replace_all_index(json, data)
        '''
        Replace *_index attribute in data given json, which contains
        all the necessary information to get *_id
        '''
        data.keys.each do |key|
            if is_index(key)
                data, _ = sub_out_index(data, json, key)
            end
        end
        return data
    end

    def sub_out_index(data, json, key)
        '''
        Helper function to sub out the *_index with *_id
        '''
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

    def get_route(route, data)
        '''
        Replace the :* attribute in route with data, which contains 
        all the information necessary for the replacement
        '''
        keys = route.scan(/(:[\w\_]+)/)
        keys.each do |key|
            key = key[0]
            label = key.gsub(':', '').to_sym
            route = route.gsub(key, data[label].to_s)
        end
        return route
    end

    def get_entry(data, result, index_on)
        '''
        data: body input for the POST /add_* route
        result: payload value from a successful POST /add_* route
        index_on: array of attributes that can serve as a key for entries
            in a table
        '''
        result.each do |entry|
            if match_all_unique_keys(data, entry, index_on)
                return entry
            end
        end
    end

    def match_all_unique_keys(data, entry, index_on)
        '''
        Returns whether all index_on attributes in data matches entry
        '''
        index_on.each do |key|
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
        '''
        Returns whether route is of the /add_* variety
        '''
        return route.scan(/(\/add_)/).length > 0
    end

    def id_name(key)
        '''
        Convert key, which in an *_index, to an *_id
        '''
        temp = key.to_s.gsub(/(_indexes|_index)/) { |m| m == '_index' ? '_id' : '_ids' }
        return temp.to_sym
    end

    def table_key(key)
        '''
        Convert key, which is an *_index, into the table name for it
        '''
        return key.to_s.gsub(/(_indexes|_index)/, 's').to_sym
    end

    def is_index(key)
        '''
        Returns whether or not key is an *_index/*_indexes or not
        '''
        return key.to_s.scan(/(_indexes|_index)/).length > 0
    end

    def generate_mock_data(entries)
        '''
        Returns generated mock data given entries, which is a JSON of
        all the tables as keys and the number of mock entry to generate as value
        '''
        records = {}
        if entries
            entries.keys.each do |key|
                records[key] = []
                records[key]= generate(records, key, entries[key])
            end
            return records
        else
            @log.append('Error: Unspecified number of entries for mock data.')
            return {}
        end
    end
end
