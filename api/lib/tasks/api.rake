namespace :api do
	desc "create yaml for API"
	task document: :environment do
		include RouteAnalyzer
		# TODO
	end

end
