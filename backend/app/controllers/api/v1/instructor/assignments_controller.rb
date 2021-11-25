# frozen_string_literal: true

class Api::V1::Instructor::AssignmentsController < ApplicationController
    # GET /sessions/:session_id/assignments
    def index
        active_user = ActiveUserService.active_user request

        # If we're here, we have `instructor` permissions, but that doesn't mean
        # we actually *are* an instructor. If we aren't an instructor, return an empty
        # array.
        active_instructor = Instructor.find_by(utorid: active_user.utorid)
        render_success([]) && return unless active_instructor

        render_success(
            Assignment.by_session(params[:session_id]).assigned_to_instructor(
                active_instructor
            ).with_pending_or_accepted_offer.map do |assignment|
                override_instance_method(
                    # Instructors aren't allowed to see the nag count of an assignment,
                    # so we override it with `nil`. Since `.save!` is never called on this object,
                    # so it's okay to manipluate it.
                    assignment,
                    :active_offer_nag_count,
                    nil
                )
            end
        )
    end
end

# Override an instance method to always return `value`
# Code modified from https://stackoverflow.com/questions/135995/is-it-possible-to-define-a-ruby-singleton-method-using-a-block
def override_instance_method(obj, method_name, value)
    metaclass =
        class << obj
            self
        end

    metaclass.send :define_method, method_name do
        value
    end

    obj
end
