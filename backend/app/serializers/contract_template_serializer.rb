# frozen_string_literal: true

class ContractTemplateSerializer < ActiveModel::Serializer
    attributes :id, :template_file, :template_name
end
