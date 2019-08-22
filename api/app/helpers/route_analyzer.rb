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
end