# frozen_string_literal: true

require 'rails_helper'

module Api
  module V1
    RSpec.describe PositionsController, type: :controller do
      describe 'GET /v1/positions' do
        before do
          get :index
        end

        it 'should give me some response' do
          # TODO: Actually check for correct response
          response.body
        end
      end
    end
  end
end
