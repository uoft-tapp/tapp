FROM ruby:2.5-alpine

# Add tzdata because the Gemfile doesn't successfully add the dependency via geminstall.
RUN apk update && apk add build-base \
  nodejs \
  postgresql-dev \
  tzdata

RUN mkdir /app
WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN bundle install

RUN rails db:migrate

COPY . .
