module RouteAnalyzer
	include FakeData
	include SeedsHandler
	def all_routes
		routes = Rails.application.routes.routes.map do |route|
			{
				path: route.path.spec.to_s.sub('(.:format)', '').sub('/api/v1', ''), 
				name: route.name, 
				controller: route.defaults[:controller],
				action: route.defaults[:action],
				method: route.name ? Rails.application.routes.named_routes[route.name].verb : nil
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
end