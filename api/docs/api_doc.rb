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
#    - :boolean
#
# The value, params, can sometimes be a symbol that is not one of the types
# defined above. This is because it is meant to denote a reference to a schema.
# For example, :instructors is a reference to the model of the Instructor
# table. Whereas, :positions is a reference to the model of the Position,
# PositionDataForMatching, and PositionDataForAd.
#
# There are two schemas for every controller that deals with a model.
# For example, Instructor has the schemas: :instructors and :instructor_input
# The former is the full model completed with attributes such as :created_at and
# :updated_at. The latter does not contain those attributes, but it does have
# required parameters for creating a new model entry. Also, note that there is
# a lack of 's' in the latter schema name.

API = {
    session_instructors: {
        summary: 'Show all instructors given session_id',
        response: {
            reference: :instructors,
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
            reference: :instructors
        }
    },
    available_position_templates: {
        summary: 'Show all available position templates',
        response: {
            reference: :position_templates,
            array: true
        }
    },
    assignment_active_offer: {
        summary: 'Show active offer given assignment_id',
        response: {
            reference: :offers
        }
    },
    offers: {
        summary: 'Create new offer',
        request: {
            required: [:assignment_id],
            params: {
                assignment_id: :integer
            }
        },
        response: {
            reference: :offers
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
            reference: :offers
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
            reference: :offers
        }
    }
}.freeze
