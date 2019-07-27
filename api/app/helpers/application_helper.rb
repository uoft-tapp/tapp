# frozen_string_literal: true

# Base class from which most applications use
module ApplicationHelper
	def json(data, include: nil, except: nil)
		if not data.is_a?(ActiveSupport::HashWithIndifferentAccess)
			data = data.as_json(except: except).with_indifferent_access
		end
		if include
			include.keys.each do |key|
				data[key] = include[key]
			end
		end
		return data
	end
end
