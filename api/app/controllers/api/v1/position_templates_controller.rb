# frozen_string_literal: true

# Controller for PositionTemplates
class Api::V1::PositionTemplatesController < ApplicationController
    before_action :find_position_template, only: %i[delete]
end
