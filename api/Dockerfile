FROM ruby:2.5-alpine

# Add tzdata because the Gemfile doesn't successfully add the dependency via geminstall.
RUN apk update && apk add build-base \
  nodejs \
  postgresql-dev \
  tzdata

RUN mkdir /app
WORKDIR /app

#ENV SECRET_KEY_BASE=982f66bccd848a241ab40e538e2ba5372220ab5a1557ec11a6c8ed2ad8b072d16bb4436dda0041e0de089f16b24fdca3106800e103be4a5dabf45c51677667db


COPY Gemfile Gemfile.lock ./

RUN bundle install

COPY ./ ./
