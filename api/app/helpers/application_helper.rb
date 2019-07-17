# frozen_string_literal: true

# Base class from which most applications use
module ApplicationHelper
	def json(data, include: nil, except: nil)
		data = JSON.parse(data.to_json.to_s, symbolize_names: true)
		if include
			include.keys.each do |key|
				data[key] = include[key]
			end
		end
		if except
			except.each do |key|
				data.delete(key)
			end
		end
		return data
	end
end
