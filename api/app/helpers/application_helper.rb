# frozen_string_literal: true

# Base class from which most applications use
module ApplicationHelper
    def json(data, include: nil, except: nil)
        unless data.is_a?(ActiveSupport::HashWithIndifferentAccess)
            data = data.as_json(except: except).with_indifferent_access
        end
        include&.keys&.each do |key|
            data[key] = include[key]
        end
        data
    end

    def filter_given_id(table, filter_id, custom_table_data = true)
        table_data = custom_table_data ? table : table.order(:id)
        table_data.select do |entry|
            entry[filter_id] == params[filter_id].to_i
        end
    end

    def index_response(table, filter_table, filter_func, custom_table_data = false)
        filter_id = table_to_id(filter_table)
        unless params.include?(filter_id)
            render_success(custom_table_data ? table : table.order(:id))
            return
        end
        return if invalid_id(filter_table, filter_id)

        render_success(filter_func)
    end

    def table_to_id(table)
        "#{table.to_s.gsub(/([a-z])([A-Z])/, '\1_\2').downcase}_id".to_sym
    end

    def create_entry(table, param_reqs, output: nil, after_fn: nil)
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

    def update_condition(table)
        params.key?(:id) && table.exists?(params[:id])
    end

    def invalid_id_check(table, outcome = [])
        invalid_id(table, table_to_id(table), outcome)
    end

    def update_entry(table, param_reqs, update_fn: nil, parts_fn: nil, merge_fn: nil)
        entry = table.find(params[:id])
        result, errors = parts_fn ? parts_fn.call(entry) : [true, nil]
        if entry.update_attributes!(param_reqs) && result
            update_fn&.call(entry)
            render_success(parts_fn ? merge_fn.call(entry) : entry)
        else
            full_error_render(parts_fn ? { errors: errors } : entry)
        end
    end

    def delete_entry(table, destroy_sub_parts = nil)
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
        render_error(entry.errors.full_messages.join('; '), payload)
    end
end
