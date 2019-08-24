namespace :api do
	desc "create yaml for API"
	task document: :environment do
		include RouteAnalyzer
		# TODO
		output = convert_to_yaml(yaml_format)
		puts output
	end

end
