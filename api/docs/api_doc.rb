# frozen_string_literal: true

# This file is responsible for API Documentation of custom routes
# The params for response can have nested values such as:
#   params: {
#       array: [:integer],
#       array_of_objects: [{
#           item1: :string,
#           item2: :float
#       }],
#       item: :datetime
#   }
# The following are the allowed types for params:
#    - :integer
#    - :float
#    - :string
#    - :datetime

API = {
    session_instructors: {
        response: {
            params: :instructors,
            array: true
        }
    },
    session_instructors_delete: {
        summary: 'Delete instructor-position relation given session_id',
        request: {
            required: [:id],
            params: {
                id: :integer
            }
        },
        response: {
            params: :instructors
        }
    },
    available_position_templates: {
        summary: 'Show all available position templates',
        response: {
            response: :position_templates,
            array: true
        }
    },
    assignment_active_offer: {
        summary: 'Show active offer given assignment_id',
        response: {
            params: :offers
        }
    },
    offers: {
        request: {
            required: [:assignment_id],
            params: {
                assignment_id: :integer
            }
        }
    },
    email_offer: {
        summary: 'Email offer to applicant',
        request: {
            required: [:id],
            params: {
                id: :integer
            }
        },
        response: {
            params: :offers
        }
    },
    offers_respond: {
        summary: 'Respond to offer',
        request: {
            required: %i[signature response],
            params: {
                signature: :string,
                response: :string
            }
        },
        response: {
            params: :offers
        }
    }
}.freeze
