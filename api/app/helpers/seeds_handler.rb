module SeedsHandler
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

	def insert_data(seed)
	    records, log = {}, []
	    seed.each do |controller|
	        data, log = read_json(controller[:file], log)
	        log_size = log.length
	        data.each_with_index do |entry, idx|
			    valid_fks, entry, log = translate_fk(controller, 
			    	entry, idx, records, log)
			    if valid_fks
		            record = existing_record(controller[:table], 
		                controller[:unique], entry)
		            if record
		                records, log = update_record(controller, 
		                    entry, record[:id], idx, records, log)
		            else
		                records, log = create_record(controller, 
		                    entry, idx, records, log)
		            end
			    end
	        end
	        if log.length == log_size
	            log.push("All entries in #{controller[:table].to_s} were inserted successfully")
	        end
	    end
	    puts log
	end

	def existing_record(table, params, entry)
	    if params.kind_of?(Array)
	        unique_data = unique_params(params, entry)
	        return table.find_by(unique_data)
	    else
	        child_unique_data = unique_params(params[:child_keys], entry)
	        child_records = params[:table].where(child_unique_data).all
	        if child_records
		        parent_unique_data = unique_params(params[:parent_keys], entry)
	        	parent_unique_data[:id] = all_parent_records(child_records, params[:id])
	            return table.where(parent_unique_data).first
	        else
	            return nil
	        end
	    end
	end

	def all_parent_records(child_records, key)
		parents = []
		child_records.map do |child|
			if not parents.include?(child[key])
				parents.push(child[key])
			end
		end
		return parents
	end

	def unique_params(params, entry)
	    unique_data = {}
	    entry.keys.each do |item|
	        if params.include?(item)
	            unique_data[item] = entry[item]
	        end
	    end
	    return unique_data
	end

	def update_record(controller, entry, id, idx, records, log)
	    route = controller[:update]
	    route = route.gsub(':id', id.to_s)
	    records, log = request_helper(controller[:table], 
	        :put, route, entry, records, log)
	    return records, log
	end

	def create_record(controller, entry, idx, records, log)
	    route = generate_route(controller[:create], entry)
	    records, log = request_helper(controller[:table], 
	        :post, route, entry, records, log)
	    return records, log
	end

	def generate_route(route, entry)
	    keys = route.scan(/(?:\:)([\w\_]+)/)
	    keys.each do |key|
	    	key = key[0]
	        route = route.gsub(":#{key}", entry[key.to_sym].to_s)
	    end
	    return route
	end

	def request_helper(table, action, route, params, records, log)
	    response = request(action, route, params)
	    if response[:status] == 'success'
	        records = add_to_records(table, response[:payload], records)
	    elsif response[:status] == 'error'
	        records = add_to_records(table, nil, records)
	        log.push(response[:message])
	    end
	    return records, log
	end

	def translate_fk(controller, entry, idx, records, log)
	    log_size = log.length
	    controller[:foreign_keys].each do |fk|
	        key, table = fk[:key], fk[:table]
	        error = "Invalid #{key} for #{controller[:table]} at entry #{idx}."
	        if entry.keys.include?(key)
	            if not multiple_ids(key)
	                entry, log = update_fk(key, table, 
	                    error, entry, records, log)
	            else
	                entry, log = update_multiple_fk(key, table, 
	                    error, entry, records, log)
	            end
	        end
	        if log.length > log_size
	            return false, entry, log
	        end
	    end
	    return true, entry, log
	end

	def update_multiple_fk(key, table, error, entry, records, log)
	    log_size = log.length
	    entry[key].each_with_index do |item, idx|
	        entry[key], log = update_fk(idx, table, error, entry[key], records, log)
	        if log.length > log_size
	            break
	        end
	    end
	    return entry, log
	end

	def update_fk(key, table, error, entry, records, log)
	    if not entry[key].is_a?(Integer)
	        log.push(error)
	        return entry, log
	    end
	    if entry[key] >= 0 and entry[key] < records[table].length
	        entry[key] = records[table][entry[key]][:id]
	    else
	        log.push(error)
	    end
	    return entry, log
	end

	def multiple_ids(key)
	    return key.to_s[-1] == 's'
	end

	def add_to_records(table, payload, records)
	    if not records.keys.include?(table)
	        records[table] = []
	    end
	    if not payload
	        records[table].push(payload)
	        return records
	    end
	    if payload.kind_of?(Array)
	        record = nil
	        record_ids = all_ids(records[table])
	        payload.each do |entry|
	            if not record_ids.include?(entry[:id])
	                record = entry
	            end
	        end
	        records[table].push(record)
	    else
	        records[table].push(payload)
	    end
	    return records
	end

	def all_ids(records)
	    return records.map do |record|
	        record[:id]
	    end
	end
end
