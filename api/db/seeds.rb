# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.

seedData = [
	{
		table: User,
		dataSource: "/user.json",
		uniqueKeys: [:utorid],
		hashKeys: [:role],
		foreignKeys: [],
	},
	{
		table: Instructor,
		dataSource: "/instructor.json",
		uniqueKeys: [:utorid],
		hashKeys: [],
		foreignKeys: [],
	},
	{
		table: Session,
		dataSource: "/session.json",
		uniqueKeys: [:name],
		hashKeys: [],
		foreignKeys: [],
	},
	{
		table: PreferenceLevel,
		dataSource: "/preference_level.json",
		uniqueKeys: [:preference_level],
		hashKeys: [],
		foreignKeys: [],
	},
	{
		table: Position,
		dataSource: "/position.json",
		uniqueKeys: [:position_code],
		hashKeys: [],
		foreignKeys: [
			{
				table: Session,
				fk: :session_id,
			}
		],
	},
	{
		table: Applicant,
		dataSource: "/applicant.json",
		uniqueKeys: [:utorid, :student_number],
		hashKeys: [],
		foreignKeys: [],
	}
]

def insert_data(seeds)
	tables = {}
	log = []
	seeds.each do |seed|
		update = false
		curr_t = seed[:table].to_s.to_sym
		tables[seed[:table]] = readJson(seed[:dataSource])
		success = 0
		tables[seed[:table]].each do |entry|
			entry = hashEntry(entry, seed[:hashKeys])
			entry = processFK(entry, seed[:foreignKeys], tables)
			if not entry
				break
			end
			if seed[:uniqueKeys].length == 0
				result = seed[:table].create(entry)
			else
				unique = getUniqueEntry(entry, seed[:uniqueKeys])
				tableEntry = seed[:table].find_by(unique)
				if tableEntry
					result = tableEntry.update_attributes(entry)
					update = true
				else
					result = seed[:table].create(entry)
				end
			end
			if result
				success += 1
			end
		end
		if success == tables[seed[:table]].length
			update = update ? "updated" : "inserted"
			log.push("#{seed[:table].to_s} data #{update}.")
		else
			log.push("Some insertions/updates to #{seed[:table].to_s} failed.")
		end
	end
	puts log
end

def processFK(entry, foreignKeys, tables)
	foreignKeys.each do |keyVal|
		fk = keyVal[:fk].to_s
		if entry.keys.include?(fk)
			table = keyVal[:table]
			if entry[fk] >= 0 and entry[fk] < tables[table].length
				parent = table.find_by(tables[table][entry[fk]])
				if parent
					entry[fk] = parent.id
				else
					puts "There't no #{entry[fk]}th entry in the JSON file for #{table.to_s}"
					return nil
				end
			else
				puts "#{entry[fk]} is an invalid for the table #{table.to_s}."
				return nil
			end
		end
	end
	return entry
end

def hashEntry(entry, hashKeys)
	hashKeys.each do |keyVal|
		strKey = keyVal.to_s
		if entry.keys.include?(strKey)
			entry[strKey] = entry[strKey].to_sym
		end
	end
	return entry
end

def getUniqueEntry(entry, uniqueKeys)
	new_entry = {}
	uniqueKeys.each do |keyVal|
		if entry.keys.include?(keyVal.to_s)
			new_entry[keyVal] = entry[keyVal.to_s]
		end
	end
	return new_entry
end

def readJson(file)
	seed_data_dir = Rails.root.join('db', 'seed')
	begin
		data = File.read("#{seed_data_dir}#{file}")
		return JSON.parse(data)
	rescue Errno::ENOENT => e
		puts e
		return []
	rescue JSON::ParserError 
		puts "#{seed_data_dir}#{file} is not a valid JSON file."
		return []
	end
end

insert_data(seedData)