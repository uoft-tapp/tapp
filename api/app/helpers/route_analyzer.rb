module RouteAnalyzer
	include FakeData
	include SeedsHandler
	def all_routes
		routes = Rails.application.routes.routes.map do |route|
			named_routes = Rails.application.routes.named_routes
			{
				path: route.path.spec.to_s.sub('(.:format)', '').sub('/api/v1', ''), 
				name: route.name, 
				controller: route.defaults[:controller],
				action: route.defaults[:action],
				method: route.name ? named_routes[route.name].verb.downcase.to_sym : nil
			} 
		end
		routes = routes.select do |route|
			route[:controller] ? !route[:controller].scan("api/v1/").empty? : false
		end
		routes.each do |entry|
			entry[:controller] = entry[:controller].sub('api/v1/', '').to_sym
			entry[:action] = entry[:action].to_sym
			entry[:required] = min_params(entry) 
			if entry[:action] == :create
				entry[:required] += index_on(entry[:controller]).map { |i| id_name(i) }
				entry[:required] = entry[:required].uniq
			end
		end
		routes
	end

	def routes_documented?(routes)
		incomplete = []
		routes.each_with_index do |route, i|
			ind = i+1
			if !route[:method] || route[:name] == "api_v1"
				incomplete.push("#{ind}. #{route[:path]}, action: :#{route[:action]}" +
					"\n\tPlease set an unique for this route in /config/routes.rb using:" +
					"\n\t\t get/post {route}, action: {action}, as: {name}")
			else
				# TODO: more tests for completeness
			end
		end
		puts incomplete.length.positive? ? "#{incomplete.join("\n\n")}\n\n" : ''
		puts "API Documentation: #{incomplete.length} todo, " +
			"#{routes.length - incomplete.length} completed, #{routes.length} total."
		return !incomplete.length.positive?
	end

	def min_params(route)
		route[:path].scan(%r{(?:\/:)([\w]+)}).map { |i| i[0].to_sym }
	end

	def model_attributes(table)
		table.columns_hash.map { |i, j| { name: i.to_sym, type: j.type } }
	end

	def format_routes()
		[]
	end

	def format_schemas()
		[]
	end

	def yaml_format
		[
			{
				name: 'openapi',
				value: '3.0.2'
			},
			{
				name: 'info',
				value: [
					{
						name: 'title',
						value: 'Tapp API'
					},
					{
						name: 'description',
						value: 'Provides information for the frontend to display and add data'
					},
					{
						name: 'version',
						value: '1.0'
					}
				]
			},
			{
				name: 'paths',
				value: format_routes()
			},
			{
				name: 'components',
				value: [
					{
						name: 'schemas',
						value: format_schemas()
					}
				]
			}
		]
	end

	def convert_to_yaml(data, output = "", tabs = 0)
		tab = "  "
		data.each do |item|
			output += "#{tab * tabs}#{item[:name]}:\n"
			if item[:value].is_a?(Array)
				output = convert_to_yaml(item[:value], output, tabs+1)
			else
				output += "#{tab * (tabs+1)}\"#{item[:value]}\"\n"
			end
		end
		output
	end

	def write_file(destination, data)
        file = File.open("#{Rails.root}#{destination}", 'w')
        file.puts(data)
	end

	def route_name(controller, route_name = nil)
		route_name = route_name ? route_name : 'create'
		"#{controller.to_s}_#{route_name}"
	end
end