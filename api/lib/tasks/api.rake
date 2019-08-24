namespace :api do
	desc "create yaml for API"
	task document: :environment do
		include RouteAnalyzer
		if !routes_documented?(all_routes)
			abort("API Documentation Incomplete.")
		end
		file = '/config/api.yml'
		write_file(file, convert_to_yaml(yaml_format))
		puts("API documentation created at #{file}")
	end

end
