# frozen_string_literal: true

class Hash::HashController < ApplicationController
    before_action :find_hash

    # /hash/*path
    # This function redirects urls from `/hash/*path` to `/#/*path`. It is needed
    # to preserve redirection functionality via shibboleth. URL hashes are used
    # in the frontend for routing. However, since URL hashes are not passed to the server,
    # they are lost. By changing the URL hash to an actual URL, we are able to preserve it
    # during authentication.
    def index
        # take special care to preserve the raw query string rather than process it
        # through rails params.
        query_string = request.query_string
        redirect_url =
            query_string.blank? ? "/##{@hash}" : "/?#{query_string}##{@hash}"
        render(
            plain:
                "<!doctype html><html>
                <head>
                    <meta charset=\"utf-8\">
                    <meta http-equiv=\"refresh\" content=\"0; URL='#{
                    redirect_url
                }'\"
                </head>
                <body>Redirecting to
                    <a href=\"#{redirect_url}\">#{redirect_url}</a>
                </body></html>",
            content_type: 'text/html'
        )
    end

    private

    def find_hash
        raw_hash = params['path']
        # we want the first character of the hash to always be `/`
        raw_hash = raw_hash.sub(%r{^([^/])}, '/\1')
        @hash = raw_hash
    end
end
