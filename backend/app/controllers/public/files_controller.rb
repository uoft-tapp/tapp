# frozen_string_literal: true

# `ApplicationControler` is set to always return JSON. In this controller we want to return
# html and pdf, so we subclass ActionController directly
class Public::FilesController < ActionController::Base
    include Response

    # /public/files/<id>
    def show
        blob = ActiveStorage::Blob.find_by!(key: show_params[:id])

        send_data blob.download,
                  filename: blob.filename.to_s, content_type: blob.content_type
    end

    private

    def show_params
        params.permit(:id)
    end
end
