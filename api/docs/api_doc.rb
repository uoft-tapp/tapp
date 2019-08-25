# frozen_string_literal: true

# This file is responsible for API Documentation of custom routes
API = {
    session_instructors_delete: {
        summary: 'Delete instructors given session_id',
        parameters: [:session_id],
        request: {
            required: [:id],
            params: {
                id: :integer
            }
        },
        response: :instructors
    }
}.freeze
