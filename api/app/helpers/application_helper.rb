# frozen_string_literal: true

# Base class from which most applications use
module ApplicationHelper
    def json(data, include: nil, except: nil)
        # Converts data into including the attributes & values from include,
        # and excluding those from except
        #
        # data: a hash or Active Record entry
        # include: hash of keys & values
        # except: an array of attributes to exclude from data
        unless data.is_a?(ActiveSupport::HashWithIndifferentAccess)
            data = data.as_json(except: except).with_indifferent_access
        end
        include&.keys&.each do |key|
            data[key] = include[key]
        end
        data
    end

    def filter_given_id(table_entries, filter_id, custom_table_data = true)
        # Filters the table_data using filter_id.
        #
        # table_entries: entries in Active Record or name of model in Active Records
        # filter_id: id used to filter the table_data
        # custom_table_data: whether or not table_entries is a custom array of entries
        #     or if it is the name of a model in the Active Records
        table_data = custom_table_data ? table_entries : table_entries.order(:id)
        table_data.select do |entry|
            entry[filter_id] == params[filter_id].to_i
        end
    end

    def index_response(table_entries, filter_table, filter_func, custom_table_data = false)
        # Shows all entries in table_entries given the filter_table
        #
        # table_entries: entries in Active Record or name of model in Active Records
        # filter_table: name of model in Active Records
        # filter_func: proc that can be called to give filtered version of table_entries
        # custom_table_data: whether or not table_entries is a custom array of entries
        #     or if it is the name of a model in the Active Records
        filter_id = table_to_id(filter_table)
        unless params.include?(filter_id)
            render_success(custom_table_data ? table_entries : table_entries.order(:id))
            return
        end
        return if invalid_id(filter_table, filter_id)

        render_success(filter_func)
    end

    def table_to_id(table)
        # Returns hash for id of table.
        #
        # table: name of model in Active Record
        case table.to_s
        when 'Applicant'
            :applicant_id
        when 'Application'
            :application_id
        when 'Assignment'
            :assignment_id
        when 'Instructor'
            :instructor_id
        when 'Position'
            :position_id
        when 'PositionPreference'
            :position_preference_id
        when 'PositionTemplate'
            :position_template_id
        when 'ReportingTag'
            :reporting_tag_id
        when 'Session'
            :session_id
        when 'WageChunk'
            :wage_chunk_id
        when 'Offer'
            :offer_id
        end
    end

    def create_entry(table, param_reqs, output: nil, after_fn: nil)
        # Create new entry in table.
        #
        # table: name of model in Active Record
        # param_reqs: attributes & values to be added to entry
        # output: proc that can be called to give all entries in table
        # after_fn: proc that can be call to add to new entry in table
        #     An example is the Position.instructors relationship
        entry = table.new(param_reqs)
        if entry.save
            if after_fn
                after_fn.call(entry)
            else
                render_success(output ? output.call : entry)
            end
        else
            entry.destroy!
            full_error_render(entry, output&.call)
        end
    end

    def should_update(table, params)
        # Return whether table should be updated.
        #
        # table: name of model in Active Record
        # params: params given in request body
        params.key?(:id) && table.exists?(params[:id])
    end

    def invalid_id_check(table, payload = [])
        # Renders an error if table contains an invalid id.
        #
        # table: name of model in Active Record
        # payload: payload of the error render
        invalid_id(table, table_to_id(table), payload)
    end

    def update_entry(entry, param_reqs, update_fn: nil, parts_fn: nil, merge_fn: nil)
        # Update entry in Active Records
        #
        # entry: entry in Active Records
        # param_reqs: attributes & values to be added to entry
        # update_fn: proc that can be called to update entry information such as
        #     the position_ids in Instructor
        # parts_fn: proc that can be called to update partitioned models such as
        #     Position which contains PostionDataForMatching
        # merge_fn: proc that can be called to give the full entry data such as
        #     Position which contains PostionDataForMatching and PositionDataForAd
        result, errors = parts_fn ? parts_fn.call(entry) : [true, nil]
        if entry.update_attributes!(param_reqs) && result
            update_fn&.call(entry)
            render_success(parts_fn ? merge_fn.call(entry) : entry)
        else
            full_error_render(parts_fn ? { errors: errors } : entry)
        end
    end

    def delete_entry(table, params, destroy_sub_parts = nil)
        # Delete entry in Active Records given table and params[:id]
        #
        # table: name of model in Active Record
        # params: params given in request body
        # destroy_sub_parts: proc that can be called to fully delete entry data such as
        #     Position which has subparts such as PostionDataForMatching and PositionDataForAd
        params.require(:id)
        entry = table.find(params[:id])
        destroy_sub_parts&.call(entry)
        if entry.destroy!
            render_success(entry)
        else
            full_error_render(entry)
        end
    end

    def full_error_render(entry, payload = nil)
        # Renders the error of an unsuccessful request as a string.
        #
        # entry: entry in Active Records
        # payload: payload to be rendered
        render_error(entry.errors.full_messages.join('; '), payload)
    end
end
