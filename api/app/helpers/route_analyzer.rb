module RouteAnalyzer
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
			entry[:params] = min_params(entry)
		end
		routes
	end

	def min_params(route)
		route[:path].scan(%r{(?:\/:)([\w]+)}).map { |i| i[0] }
	end
end