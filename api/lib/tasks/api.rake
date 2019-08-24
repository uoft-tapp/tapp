namespace :api do
	desc "create yaml for API"
	task document: :environment do
		include RouteAnalyzer
		data = convert_to_yaml(yaml_format)
		write_file('/config/api.yml', data)
	end

end
