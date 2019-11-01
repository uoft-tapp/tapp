FROM madnight/docker-alpine-wkhtmltopdf:latest as wkhtmltopdf_image
FROM ruby:2.6.5-alpine3.10

# Add tzdata because the Gemfile doesn't successfully add the dependency via geminstall.
RUN apk update && apk add build-base \
  nodejs \
  postgresql-dev \
  tzdata \
  graphviz

RUN apk add --update --no-cache \
  libgcc libstdc++ libx11 glib libxrender libxext libintl \
  libcrypto1.1 libssl1.1 \
  ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family

COPY --from=wkhtmltopdf_image /bin/wkhtmltopdf /bin/

RUN mkdir /app
WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN bundle install --jobs 8

COPY . ./
