# frozen_string_literal: true

class Api::V1::DebugController < ApplicationController
    # GET /users
    def users
        render_success User.all
    end

    # POST /users
    def upsert_user
        # We can update a user by id or utorid
        @user = User.find_by(id: params[:id])
        update_user && return if @user

        @user = User.find_by(utorid: params[:utorid])
        update_user && return if @user

        @user = User.new(user_params)
        render_on_condition(object: @user, condition: proc { @user.save! })
    end

    # GET /active_user
    def active_user
        render_success ActiveUserService.active_user request
    end

    # POST /active_user
    def set_active_user
        @active_user =
            User.find_by(id: set_active_user_params[:id]) ||
                User.find_by(utorid: set_active_user_params[:utorid])
        if @active_user
            Rails.application.config.active_user_id = @active_user.id
            return render_success @active_user
        end
        render_error(
            message: "Could not find user matching #{set_active_user_params}"
        )
    end

    # POST /snapshot
    def snapshot
        Rake::Task['debug:snapshot'].execute
        render_success
    end

    # POST /clear_data
    def clear_data
        # 'db:truncate_all' is about 50% faster than 'db:schema:load', which accomplished
        # the same thing.
        Rake::Task['db:truncate_all'].execute
        render_success
    end

    # POST /restore_snapshot
    def restore_snapshot
        Rake::Task['debug:restore'].execute
        render_success
    end

    # GET /routes
    def routes
        # Returns a list of all TAPP-specific routes available.
        all_routes = []
        Rails
            .application
            .routes
            .routes
            .each do |route|
                path = route.path.spec.to_s

                # skip over any /rails specific routes
                if !path.start_with?('/api/') && !path.start_with?('/public')
                    next
                end

                # skip any routes that don't have a controller
                next if route.requirements[:controller].nil?

                controller_name =
                    "#{route.requirements[:controller].camelize}Controller"
                action_name = route.requirements[:action]

                all_routes.push(
                    {
                        path: path,
                        verb: route.verb,
                        parts: route.required_parts,
                        controller: controller_name,
                        action: action_name,
                        source_location:
                            get_controller_source(controller_name, action_name)
                    }
                )
            end
        render_success all_routes
    end

    # GET /serializers
    def serializers
        # Returns a list of all serializers and attributes that are serialized.
        # These make up the majority of the available return types from the API

        # Since Rails dynamically loads classes the first time they're requested,
        # we cannot rely on introspection to get a list of all the serializers. Instead,
        # we must list all files in the serializers directory; since the files must
        # follow the naming convention, we can assume they all contain valid serializers
        # of the same name.
        render_success Dir.foreach(Rails.root.join('app', 'serializers'))
                           .select do |file_name|
            file_name.ends_with? 'serializer.rb'
        end.map do |file_name|
            File.basename file_name, File.extname(file_name)
        end.map do |serializer_name|
            serializer_name.camelize.constantize
        end.map do |serializer|
            {
                name: serializer.to_s.chomp('Serializer'),
                serializer: serializer.to_s,
                attributes:
                    serializer._attributes.map(&:to_s) +
                        (
                            # if `explicit_attributes` is defined, we also want to
                            # include any of those listed attributes
                            if serializer.respond_to? :explicit_attributes
                                serializer.explicit_attributes
                            else
                                []
                            end
                        ).map(&:to_s)
            }
        end
    end

    private

    def get_controller_source(controller_name, action_name)
        controller_name
            .constantize
            .instance_method(action_name.to_sym)
            .source_location
    rescue NameError
        ['No Method Found', 0]
    end

    def set_active_user_params
        params.permit(:id, :utorid)
    end

    def user_params
        params.permit(:id, :utorid, roles: [])
    end

    def update_user
        render_on_condition(
            object: @user,
            condition: proc { @user.update!(user_params) }
        )
    end
end
